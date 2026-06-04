#!/usr/bin/env python3
"""
Reset the database: drop all tables and recreate them.
Run from the project root:  python reset_db.py
"""
import os
import sys
from pathlib import Path

# Ensure project root is on sys.path so backend.db.models can be imported
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from dotenv import load_dotenv
from sqlalchemy import create_engine
from backend.db.models import Base

load_dotenv()

DEFAULT_DB_PATH = ROOT_DIR / "backend" / "local.db"
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{DEFAULT_DB_PATH}')

print(f"Using DATABASE_URL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite:") else {},
)

print("Dropping existing tables...")
Base.metadata.drop_all(engine)
print('[OK] Dropped all tables')

print("Creating tables from models...")
Base.metadata.create_all(engine)
print('[OK] Created all tables from models')

print()
print('[OK] Database reset successful!')
