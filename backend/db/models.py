# models.py

from datetime import datetime, timezone
from sqlalchemy import ForeignKey, Integer, String, Text, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow():
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String)


class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[UUID] = mapped_column(UUID, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[UUID] = mapped_column(UUID, primary_key=True)
    chat_id: Mapped[UUID] = mapped_column(ForeignKey("chats.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    parent_id: Mapped[UUID | None] = mapped_column(ForeignKey("nodes.id"), nullable=True)
    token: Mapped[int] = mapped_column(Integer, nullable=False)      # per‑chat counter
    path: Mapped[str] = mapped_column(Text, nullable=False)          # e.g., "/0/1/3"
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
    depth: Mapped[int] = mapped_column(Integer, nullable=False)

    # Self‑ref parent/children
    parent: Mapped["Node"] = relationship("Node", remote_side=[id], back_populates="children")
    children: Mapped[list["Node"]] = relationship("Node", back_populates="parent")