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

# Initialize database schema
database.create_db_and_tables()

# Ensure default user exists
def ensure_default_user():
    """Create default user if it doesn't exist"""
    db = next(database.get_session())
    try:
        user = db.query(models.User).filter(models.User.id == 1).first()
        if not user:
            default_user = models.User(id=1, email="default@forklm.local")
            db.add(default_user)
            db.commit()
            print("✓ Created default user with id=1")
        else:
            print("✓ Default user already exists")
    except Exception as e:
        print(f"Error ensuring default user: {e}")
        db.rollback()
    finally:
        db.close()

ensure_default_user()

# Optional: Configure Gemini API from environment for backward compatibility
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", None)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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
    api_key: Optional[str] = None

class SetAPIKeyBody(BaseModel):
    api_key: str

def generate_response(messages, api_key: Optional[str] = None):
    """Generate response using Google Gemini API"""
    try:
        if not api_key:
            raise ValueError("No API key provided. Please set your Gemini API key in settings.")
        
        # Configure with user's API key
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name="gemini-flash-latest")
        
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

def generate_summary(messages, api_key: Optional[str] = None):
    """Generate summary using Google Gemini API for checkpoint nodes"""
    try:
        if not api_key:
            return None
        
        # Configure with user's API key
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name="gemini-flash-latest")
        
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


def create_node(db: Session, chat_id: str, selected_node_id: str | None, prompt: str, response: str, api_key: Optional[str] = None):
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
        summary=generate_summary(context, api_key) if depth % 5 == 0 else None,
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
    if not body.api_key:
        raise HTTPException(status_code=400, detail="API key is required. Please set your Gemini API key in settings.")
    
    messages = build_branch_messages(db, chat_id, body.selected_node_id)
    messages.append({"role": "user", "content": body.prompt})
    llm_text = generate_response(build_branch_messages(db, chat_id, body.selected_node_id) + [{"role": "user", "content": body.prompt}], body.api_key)
    node = create_node(db, chat_id, body.selected_node_id, body.prompt, llm_text, body.api_key)

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

@app.post("/users/api-key")
def set_api_key(body: SetAPIKeyBody, user_id: int = 1, db: Session = Depends(get_db)):
    """Set or update the user's Gemini API key"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        # Create user if doesn't exist
        user = models.User(id=user_id, email=f"user_{user_id}@forklm.local", gemini_api_key=body.api_key)
        db.add(user)
    else:
        user.gemini_api_key = body.api_key
    
    db.commit()
    db.refresh(user)
    
    return {"ok": True, "message": "API key saved successfully"}

@app.get("/users/api-key")
def get_api_key(user_id: int = 1, db: Session = Depends(get_db)):
    """Get the user's Gemini API key status"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user or not user.gemini_api_key:
        return {"api_key": None, "is_set": False}
    
    # Return masked key for security (only show last 4 characters)
    masked_key = "..." + user.gemini_api_key[-4:] if len(user.gemini_api_key) > 4 else "..."
    return {"api_key": masked_key, "is_set": True}