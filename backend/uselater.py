from sqlalchemy import select, func, UUID
from sqlalchemy.orm import Session
import uuid

# Assume your mapped class looks like:
# class Node(Base):
#     __tablename__ = "nodes"
#     id = mapped_column(UUID, primary_key=True)
#     chat_id = mapped_column(UUID, nullable=False)
#     parent_id = mapped_column(UUID, nullable=True)
#     token = mapped_column(SMALLINT, nullable=False)
#     path = mapped_column(Text, nullable=False)
#     prompt = mapped_column(Text, nullable=False)
#     response = mapped_column(Text, nullable=True)
#     created_at = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
#     depth = mapped_column(Integer, nullable=False)


def compute_new_token_and_path(session: Session, *, chat_id: UUID, parent_id: UUID | None = None):
    # 1. Get MAX(token) for this chat_id
    stmt_max = select(func.max(Node.token)).where(Node.chat_id == chat_id)
    max_token_row = session.execute(stmt_max).scalar()
    new_token = (max_token_row or 0) + 1

    # 2. Compute new path
    if parent_id is None:
        new_path = f"/{new_token}"
    else:
        stmt_parent = select(Node.path).where(Node.id == parent_id)
        parent_path_row = session.execute(stmt_parent).scalar()

        if parent_path_row is None:
            raise ValueError("Parent node not found")

        new_path = f"{parent_path_row}/{new_token}"

    # 3. New node UUID
    new_node_id = uuid.uuid4()  # UUID, not str yet

    return {
        "id": new_node_id,
        "token": new_token,
        "path": new_path,
    }

# Inside your /chat endpoint, after LLM reply:
info = compute_new_token_and_path(
    session=db,
    chat_id=current_chat.id,
    parent_id=selected_node.id if selected_node else None,
)

new_node = Node(
    id=info["id"],
    chat_id=chat_id,
    user_id=1,  # dummy user
    parent_id=parent_id,
    token=info["token"],
    path=info["path"],
    prompt=user_prompt,
    response=llm_reply,
    depth=len(info["path"].split("/")) - 1,  # 0 for root, 1 for first child, etc.
)

db.add(new_node)
db.commit()