# database.py
from datetime import datetime, timezone
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from .models import Base

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def create_random_uuid():
    return uuid.uuid4()

DATABASE_URL = "postgresql+psycopg://fork_lm:dev123@localhost:5432/fork_lm"

engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    Base.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session