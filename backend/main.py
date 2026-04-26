import uuid
import os
from datetime import datetime, timezone
from typing import Optional

import google.generativeai as genai
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

from backend.db import database, models

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set. Please add it to your .env file.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-latest")

app = FastAPI(title="Fork-LM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = next(database.get_session())
    try:
        yield db
    finally:
        db.close()

def utcnow():
    return datetime.now(timezone.utc)

def create_random_uuid():
    return str(uuid.uuid4())

class SendBody(BaseModel):
    prompt: str
    selected_node_id: Optional[str] = None

def generate_response(messages):
    """Generate response using Google Gemini API"""
    try:
        # Convert messages to Gemini format
        # Filter out system messages and format for Gemini
        conversation_history = []
        for msg in messages:
            if msg["role"] == "system":
                # Prepend system message to first user message
                continue
            elif msg["role"] == "user":
                conversation_history.append({
                    "role": "user",
                    "parts": [msg["content"]]
                })
            elif msg["role"] == "assistant":
                conversation_history.append({
                    "role": "model",
                    "parts": [msg["content"]]
                })
        
        # Start chat session with history
        chat = model.start_chat(history=conversation_history[:-1] if len(conversation_history) > 1 else [])
        
        # Send the last user message and get response
        last_message = conversation_history[-1]["parts"][0] if conversation_history else ""
        response = chat.send_message(last_message)
        
        return response.text
    except Exception as e:
        print(f"Error generating response with Gemini: {e}")
        return f"I apologize, but I encountered an error: {str(e)}"

def generate_summary(messages):
    """Generate summary using Google Gemini API for checkpoint nodes"""
    try:
        # Build context from messages
        context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        summary_prompt = f"""Please provide a brief 1-2 sentence summary of this conversation section:

{context}

Summary:"""
        
        response = model.generate_content(summary_prompt)
        return response.text
    except Exception as e:
        print(f"Error generating summary with Gemini: {e}")
        return None

#only one database fetch and return the complete ancestor chain from root to selected node
def get_ancestor_chain(db: Session, chat_id: str, node_id: str):
    node = db.get(models.Node, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Build all ancestor paths from the node's path
    # Example: if path is "/0/1/3", we need paths: "/0", "/0/1", "/0/1/3"
    path_parts = node.path.strip('/').split('/')
    
    ancestors = []
    for i in range(1, len(path_parts) + 1):
        ancestor_path = '/' + '/'.join(path_parts[:i])
        ancestor = db.query(models.Node).filter(
            models.Node.chat_id == chat_id,
            models.Node.path == ancestor_path
        ).first()
        if ancestor:
            ancestors.append(ancestor)
    
    return ancestors

# Get context of branch from previous node with summary until selected node, and build messages for LLM (without fetching everything, only fetching summaries for checkpoints and prompts/responses for selected branch)
# without fetching full ancestor chain
def build_branch_messages(db: Session, chat_id: str, selected_node_id: str | None):
    messages = []
    if selected_node_id:
        node = db.get(models.Node, selected_node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Selected node not found")

        # Fetch ancestors with summaries
        ancestors = get_ancestor_chain(db, chat_id, selected_node_id)
        for ancestor in ancestors:
            if ancestor.summary:
                messages.append({"role": "system", "content": f"Summary of previous conversation: {ancestor.summary}"})
            else:
                if ancestor.prompt:
                    messages.append({"role": "user", "content": ancestor.prompt})
                if ancestor.response:
                    messages.append({"role": "assistant", "content": ancestor.response})

    return messages


def create_node(db: Session, chat_id: str, selected_node_id: str | None, prompt: str, response: str):
    parent = None
    if selected_node_id:
        parent = db.get(models.Node, selected_node_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent node not found")

    result = db.execute(
        text("SELECT COALESCE(MAX(token), 0) FROM nodes WHERE chat_id = :chat_id"),
        {"chat_id": chat_id},
    )
    max_token = result.scalar() or 0
    new_token = max_token + 1

    new_path = f"/{new_token}" if parent is None else f"{parent.path}/{new_token}"
    depth = len([p for p in new_path.split("/") if p])

    context = build_branch_messages(db, chat_id, selected_node_id)

    context.append({"role": "user", "content": prompt})

    node = models.Node(
        id=create_random_uuid(),
        chat_id=chat_id,
        user_id=1,
        parent_id=parent.id if parent else None,
        token=new_token,
        path=new_path,
        prompt=prompt,
        response=response,
        created_at=utcnow(),
        depth=depth,
        # Auto-generate summary if checkpoint node
        summary=generate_summary(context) if depth % 5 == 0 else None,
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return node



@app.get("/chats")
def list_chats(user_id: int = 1, db: Session = Depends(get_db)):
    chats = db.query(models.Chat).filter(models.Chat.user_id == user_id).all()
    return [
        {
            "id": str(chat.id),
            "user_id": chat.user_id,
            "title": chat.title,
            "created_at": chat.created_at,
        }
        for chat in chats
    ]

@app.post("/chats")
def create_chat(user_id: int = 1, title: str | None = None, db: Session = Depends(get_db)):
    chat = models.Chat(
        id=create_random_uuid(),
        user_id=user_id,
        title=title,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {
        "id": str(chat.id),
        "user_id": chat.user_id,
        "title": chat.title,
        "created_at": chat.created_at,
    }

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: str, db: Session = Depends(get_db)):
    chat = db.query(models.Chat).filter(models.Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.query(models.Node).filter(models.Node.chat_id == chat_id).delete()
    db.query(models.Chat).filter(models.Chat.id == chat_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/chats/{chat_id}/nodes")
def get_nodes(chat_id: str, selected_node_id: str | None = None, db: Session = Depends(get_db)):
    nodes_q = db.query(models.Node).filter(models.Node.chat_id == chat_id)

    if selected_node_id:
        ancestors = get_ancestor_chain(db, chat_id, selected_node_id)
        return {
            "view": "linear",
            "nodes": [
                {
                    "id": str(n.id),
                    "chat_id": str(n.chat_id),
                    "parent_id": str(n.parent_id) if n.parent_id else None,
                    "token": n.token,
                    "path": n.path,
                    "prompt": n.prompt,
                    "response": n.response,
                    "created_at": n.created_at,
                    "depth": n.depth,
                }
                for n in ancestors
            ],
        }

    all_nodes = nodes_q.all()
    return {
        "view": "tree",
        "nodes": [
            {
                "id": str(n.id),
                "chat_id": str(n.chat_id),
                "parent_id": str(n.parent_id) if n.parent_id else None,
                "token": n.token,
                "path": n.path,
                "prompt": n.prompt,
                "response": n.response,
                "created_at": n.created_at,
                "depth": n.depth,
            }
            for n in all_nodes
        ],
    }

@app.post("/chats/{chat_id}/send")
def send_message(chat_id: str, body: SendBody, db: Session = Depends(get_db)):
    messages = build_branch_messages(db, chat_id, body.selected_node_id)
    messages.append({"role": "user", "content": body.prompt})
    llm_text = generate_response(build_branch_messages(db, chat_id, body.selected_node_id) + [{"role": "user", "content": body.prompt}])
    node = create_node(db, chat_id, body.selected_node_id, body.prompt, llm_text)

    return {
        "node": {
            "id": str(node.id),
            "chat_id": str(node.chat_id),
            "parent_id": str(node.parent_id) if node.parent_id else None,
            "token": node.token,
            "path": node.path,
            "prompt": node.prompt,
            "response": node.response,
            "created_at": node.created_at,
            "depth": node.depth,
            "summary": node.summary,
        }
    }