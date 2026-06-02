#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from backend.db.models import Base

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg://fork_lm:dev123@localhost:5432/fork_lm')
if 'asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('postgresql+asyncpg', 'postgresql+psycopg')

print(f"Using DATABASE_URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, echo=False)

# Drop all tables in reverse order of dependencies
print("Dropping existing tables...")
with engine.begin() as conn:
    conn.execute(text('DROP TABLE IF EXISTS nodes CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS chats CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS users CASCADE;'))
    print('✓ Dropped all tables')

# Recreate tables from models
print("Creating tables from models...")
Base.metadata.create_all(engine)
print('✓ Created all tables from models')

# Verify tables exist
print("Verifying tables...")
with engine.begin() as conn:
    result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
    tables = [row[0] for row in result]
    print(f'✓ Tables created: {tables}')
    
    # Check chats table structure
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='chats'
        ORDER BY ordinal_position
    """))
    print('\n✓ Chats table columns:')
    for col_name, data_type in result:
        print(f'  - {col_name}: {data_type}')

print('\n✓ Database reset successful!')
