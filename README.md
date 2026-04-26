# ForkLM - Branching LLM Conversation Platform

ForkLM is a web application that allows users to have interactive conversations with large language models (LLMs) while maintaining the ability to branch conversations at any point. This creates a tree-like structure where users can explore different conversation paths and compare LLM responses.

## Features

- **Branching Conversations**: Fork conversations at any point to explore alternative paths
- **Chat Management**: Organize and manage multiple conversations
- **Node-based Structure**: Each message and response is stored as a node with parent-child relationships
- **User Accounts**: Multi-user support with personalized chat histories
- **Web Interface**: Modern React-based UI for seamless interaction

## Project Structure

```
ForkLM/
├── backend/              # FastAPI backend server
│   ├── main.py          # FastAPI app and routes
│   ├── db/              # Database layer
│   │   ├── database.py  # Database configuration and session management
│   │   ├── models.py    # SQLAlchemy ORM models
│   └── ForkVenv/        # Python virtual environment
├── frontend/            # React + TypeScript frontend
│   └── fork_lm/         # Vite + React application
│       ├── src/         # React components and utilities
│       ├── public/      # Static assets
│       └── package.json # Node dependencies
└── README.md           # This file
```

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Python Version**: 3.13+

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Graph Visualization**: React Flow (@xyflow/react) and Dagre
- **HTTP Client**: Axios

## Prerequisites

- **Python 3.13+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 12+** running locally
- Git (optional, for version control)

## Setup Instructions

### 1. Database Setup

Before running the application, ensure PostgreSQL is running and create the database:

```bash
# Using psql (PostgreSQL command-line)
psql -U postgres

# In the PostgreSQL prompt:
CREATE USER fork_lm WITH PASSWORD 'dev123';
CREATE DATABASE fork_lm OWNER fork_lm;
```

Alternatively, use your preferred PostgreSQL GUI tool (pgAdmin, DBeaver, etc.) to:
1. Create a new user: `fork_lm` with password `dev123`
2. Create a new database: `fork_lm` with owner `fork_lm`

### 2. Backend Setup

Navigate to the backend directory and set up the Python virtual environment:

```bash
cd backend

# Activate the virtual environment (Windows)
ForkVenv\Scripts\activate

# For other systems (macOS/Linux):
# source ForkVenv/bin/activate

# Install/upgrade dependencies (if needed)
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv

# Initialize the database
python -c "from backend.db.database import create_db_and_tables; create_db_and_tables()"
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend/fork_lm

# Install npm dependencies
npm install
```

## Running for Development

### Quick Start (Recommended)

Use the provided development script to automatically run both the backend and frontend:

**Windows (Batch):**
```bash
cd ForkLM
dev-run.bat
```

**Windows (PowerShell):**
```powershell
cd ForkLM
.\dev-run.ps1
```

**macOS/Linux:**
```bash
cd ForkLM
./dev-run.sh
```

This will:
1. Open the backend terminal and start the FastAPI server on `http://localhost:8000`
2. Open the frontend terminal and start the development server on `http://localhost:5173`

### Manual Start

If you prefer to run the services manually:

**Terminal 1 - Backend:**
```bash
cd backend
ForkVenv\Scripts\activate  # Windows
# source ForkVenv/bin/activate  # macOS/Linux

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend/fork_lm
npm run dev
```

Then open your browser and navigate to: **http://localhost:5173**

## API Documentation

Once the backend is running, you can access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Configuration

The application uses the following configuration (located in `backend/db/database.py`):

```
DATABASE_URL = "postgresql+psycopg://fork_lm:dev123@localhost:5432/fork_lm"
```

To modify the database connection, update the `DATABASE_URL` variable in `backend/db/database.py`.

## Available Scripts

### Frontend Scripts

Navigate to `frontend/fork_lm` and run:

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

### Backend

To run the backend with auto-reload:

```bash
cd backend
ForkVenv\Scripts\activate
uvicorn backend.main:app --reload
```

## Database Models

### User
- `id`: Primary key
- `email`: User email address

### Chat
- `id`: UUID primary key
- `user_id`: Foreign key to User
- `title`: Chat title/name
- `created_at`: Timestamp

### Node
- `id`: UUID primary key
- `chat_id`: Foreign key to Chat
- `user_id`: Foreign key to User
- `parent_id`: Foreign key to parent Node (self-referencing)
- `token`: Per-chat counter
- `path`: Hierarchical path (e.g., "/0/1/3")
- `prompt`: User's input prompt
- `response`: LLM response
- `summary`: Optional summary of the node
- `depth`: Depth in the conversation tree
- `created_at`: Timestamp

## Troubleshooting

### Port Already in Use

If port 8000 or 5173 is already in use:

**Backend** (change to different port):
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```
Then update the CORS origins in `backend/main.py`.

**Frontend** (Vite will automatically try the next available port):
```bash
npm run dev -- --port 5174
```

### Database Connection Issues

- Ensure PostgreSQL is running: `psql -U postgres`
- Verify the database exists: `\l` (in psql)
- Check credentials in `backend/db/database.py`
- Ensure the `fork_lm` user has proper permissions

### Virtual Environment Issues

If the virtual environment is not working:

```bash
cd backend
python -m venv ForkVenv
ForkVenv\Scripts\activate
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv
```

### Frontend Build Issues

Clear node modules and reinstall:

```bash
cd frontend/fork_lm
rm -rf node_modules package-lock.json  # macOS/Linux: use rm
del node_modules\* package-lock.json   # Windows: use del
npm install
```

## Development Workflow

1. Ensure both backend and frontend are running
2. Make changes to the code
3. Backend: Changes are auto-reloaded by Uvicorn
4. Frontend: Changes are hot-reloaded by Vite
5. Test in the browser at http://localhost:5173

## Contributing

When making changes:
- Keep commits focused and descriptive
- Test both backend and frontend functionality
- Follow existing code style and conventions
- Update documentation as needed

## License

Specify your license here.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

## Future Enhancements

- [ ] Integration with real LLM APIs (OpenAI, Google Generative AI, etc.)
- [ ] User authentication and session management
- [ ] Conversation export (JSON, PDF)
- [ ] Sharing conversations with other users
- [ ] Search and filtering for conversations
- [ ] Dark mode support
- [ ] Mobile-responsive UI
- [ ] Conversation cost tracking
