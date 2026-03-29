# forklm_project/backend/main.py
import uuid
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from backend.db import database, models
from fastapi.middleware.cors import CORSMiddleware
# , schemas

app = FastAPI(title="Fork-LM Backend")

# --- Dependency --- #



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = next(database.get_session())  # gets Session from database.py
    try:
        yield db
    finally:
        db.close()

def create_random_uuid():
    return str(uuid.uuid4())

# --- API Endpoints --- #
#fetch all chats for sidebar
@app.get("/chats")
def list_chats(
    user_id: int = 1,  # dummy for MVP
    db: Session = Depends(get_db),
):
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
def create_chat(
    user_id: int = 1,  # dummy for MVP
    title: str | None = None,
    db: Session = Depends(get_db),
):
    chat = models.Chat(
        id=database.create_random_uuid(),  # you’ll define this helper next
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


@app.get("/chats/{chat_id}/nodes")
def get_nodes(
    chat_id: str,
    selected_node_id: str | None = None,  # if present, return context (selected → root)
    db: Session = Depends(get_db),
):
    # 1. Build query for all nodes in this chat
    nodes_q = db.query(models.Node).filter(models.Node.chat_id == chat_id)

    # 2. For chat view: ancestors of selected_node
    if selected_node_id:
        selected = db.get(models.Node, selected_node_id)
        if not selected:
            raise HTTPException(status_code=404, detail="Node not found")

        # tokenize and slice path: split "/0/1/3" → [0,1,3]
        path_parts = selected.path.strip("/").split("/")
        ancestor_tokens = [int(t) for t in path_parts]

        # fetch ancestors ordered by token (root to selected)
        ancestors = (
            db.query(models.Node)
            .filter(
                models.Node.chat_id == chat_id,
                models.Node.token.in_(ancestor_tokens),
            )
            .order_by(models.Node.token)
            .all()
        )

        return {
            "view": "linear",
            "nodes": [
                {
                    "id": str(n.id),
                    "chat_id": str(n.chat_id),
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

    # 3. For tree view: all nodes of the chat
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

# --- 2. POST /chat → insert a node (MVP) --- #

import httpx  # for LLM call; replace with your LLM client

LLM_API_URL = "http://localhost:8001/v1/chat/completions"
LLM_MODEL = "gpt-3.5-turbo"




def call_llm(prompt: str) -> str:
    # Mock: echo back a deterministic reply; remove when you plug in real LLM
    return f"I received your prompt: {prompt}\n\nThis is a mock assistant reply from Fork-LM."


@app.post("/chat")
def handle_chat(
    chat_id: str,
    user_prompt: str,
    selected_node_id: str | None = None,
    db: Session = Depends(get_db),
):
    # 1. Get parent node (if any)
    parent = None
    if selected_node_id:
        parent = db.get(models.Node, selected_node_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent node not found")

    # 2. Compute new token
    result = db.execute(
        text("SELECT COALESCE(MAX(token), 0) FROM nodes WHERE chat_id = :chat_id"),
        {"chat_id": chat_id},
    )
    max_token_row = result.scalar() or 0
    new_token = max_token_row + 1

    # 3. Build path
    if parent is None:
        new_path = f"/{new_token}"
    else:
        new_path = f"{parent.path}/{new_token}"

    # 4. LLM call + node creation (rest unchanged)
    llm_reply = call_llm(user_prompt)

    new_node = models.Node(
        id=database.create_random_uuid(),
        chat_id=chat_id,
        user_id=1,
        parent_id=parent.id if parent else None,
        token=new_token,
        path=new_path,
        prompt=user_prompt,
        response=llm_reply,
        created_at=database.utcnow(),
        depth=len(new_path.split("/")) - 1,
    )

    db.add(new_node)
    db.commit()
    db.refresh(new_node)

    return {
        "node": {
            "id": str(new_node.id),
            "chat_id": str(new_node.chat_id),
            "token": new_node.token,
            "path": new_node.path,
            "prompt": new_node.prompt,
            "response": new_node.response,
            "created_at": new_node.created_at,
            "depth": new_node.depth,
        },
    }