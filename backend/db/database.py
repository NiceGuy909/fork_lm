# database.py
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from .models import Base

# Load environment variables
load_dotenv()

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def create_random_uuid():
    return uuid.uuid4()

# Read DATABASE_URL from environment, with fallback
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://fork_lm:dev123@localhost:5432/fork_lm")

# Convert asyncpg to psycopg if needed (for sync SQLAlchemy)
if "asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg")

engine = create_engine(DATABASE_URL, echo=False)

def create_db_and_tables():
    Base.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session