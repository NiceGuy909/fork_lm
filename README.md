# ForkLM - Branching LLM Conversation Platform

ForkLM is a web application that lets you have interactive conversations with Google Gemini while maintaining the ability to **branch conversations at any point**. This creates a tree-like structure where you can explore different conversation paths and compare responses side by side.

## Features

- **Branching Conversations**: Fork conversations at any point to explore alternative paths
- **Chat Management**: Organize and manage multiple conversations
- **Node-based Structure**: Each message and response is stored as a node with parent-child relationships
- **Bring Your Own Key (BYOK)**: Use your own Gemini API key — no server-side key required
- **Auto-Summarization**: Long branches are automatically summarized at checkpoints for context

## Project Structure

```
ForkLM/
├── backend/              # FastAPI backend server
│   ├── main.py          # FastAPI app, routes, Gemini integration
│   ├── db/              # Database layer
│   │   ├── database.py  # SQLAlchemy engine and session management
│   │   └── models.py    # ORM models (User, Chat, Node)
│   ├── ForkVenv/        # Python virtual environment (gitignored)
│   └── requirements.txt # Python dependencies
├── frontend/            # React + TypeScript frontend
│   └── fork_lm/         # Vite + React application
│       ├── src/         # React components and utilities
│       ├── public/      # Static assets
│       └── package.json # Node dependencies
├── setup.ps1           # One-step setup script
├── dev-run.ps1         # Launch both backend and frontend
├── reset_db.py         # Drop and recreate all tables
└── README.md           # This file
```

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (via SQLAlchemy)
- **Python Version**: 3.11+ (use official python.org installer, see note below)
- **LLM API**: Google Gemini (`google-genai` SDK)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Graph Visualization**: React Flow (@xyflow/react) and Dagre
- **HTTP Client**: Axios

## Prerequisites

- **Python 3.11+** ([python.org](https://www.python.org/downloads/) installer — **not** MSYS2/Cygwin Python)
- **Node.js 18+** with npm
- **SQLite** (no external database server required)
- Git (optional)

> ⚠️ **Important**: This project requires a standard **python.org** Python installation.  
> MSYS2 / Cygwin / Windows Store Python have non-standard platform tags (`mingw_x86_64_ucrt`) that are incompatible with the pre-built wheels on PyPI for `cryptography`, `pydantic-core`, and other packages that use the `maturin` build backend. If you use MSYS2 Python, pip will try to build these from source, which will fail.

### Verify Your Python Installation

Run this check to confirm your Python has the correct platform tag:

```powershell
python -c "import sysconfig; print(sysconfig.get_platform())"
```

Expected output: `win_amd64`

If it prints `mingw_x86_64_ucrt` (or anything other than `win_amd64`), you are using MSYS2 Python — install python.org Python and use its full path to create the venv.

To find the path of python.org Python (if you have both installed):

```powershell
# Look for the standard install location
& "C:\Program Files\Python311\python.exe" -c "import sysconfig; print(sysconfig.get_platform())"

# Or via the Windows Launcher (if installed)
py -3.11 -c "import sysconfig; print(sysconfig.get_platform())"
```

## Setup Instructions

### 1. Backend Setup

From the repo root, run the automated setup script:

```powershell
.\setup.ps1
```

This will:
- Create `backend/ForkVenv` if it doesn't exist
- Install Python dependencies from `backend/requirements.txt`
- Initialize the SQLite database at `backend/local.db`

#### Manual backend setup (if you prefer):

If `python` resolves to the correct python.org installation:

```powershell
# Create virtual environment
python -m venv backend\ForkVenv

# Activate it (Windows)
backend\ForkVenv\Scripts\activate

# (macOS/Linux)
# source backend/ForkVenv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r backend\requirements.txt

# Initialize the database
python -c "from backend.db.database import create_db_and_tables; create_db_and_tables()"
```

**If you have multiple Python installations (e.g., MSYS2 + python.org), use the full path of the python.org Python to create the venv:**

```powershell
# Create venv with the correct Python explicitly
& "C:\Program Files\Python311\python.exe" -m venv backend\ForkVenv

# Activate
backend\ForkVenv\Scripts\activate

# Upgrade pip inside the venv
python -m pip install --upgrade pip

# Install dependencies
pip install -r backend\requirements.txt

# Initialize the database
python -c "from backend.db.database import create_db_and_tables; create_db_and_tables()"
```

### 2. Frontend Setup

```bash
cd frontend/fork_lm
npm install
```

### 3. Gemini API Key

You need a Gemini API key to use ForkLM. You can either:

- **Set it in the app UI** (BYOK): Click the ⚙️ settings icon and paste your key. The key is sent with each request and never stored server-side (see `BYOK_SETUP.md`).
- **Set it in `.env`**: Create a `.env` file in the project root:
  ```
  GEMINI_API_KEY=your_api_key_here
  ```
  This key is used as a fallback when no per-request key is provided.

Get your free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Running for Development

### Quick Start (Recommended)

```powershell
.\dev-run.ps1
```

This opens two PowerShell windows:
1. **Backend** — FastAPI on `http://localhost:8000`
2. **Frontend** — Vite on `http://localhost:5173`

### Manual Start

**Terminal 1 — Backend:**
```bash
cd backend
ForkVenv\Scripts\activate  # Windows
# source ForkVenv/bin/activate  # macOS/Linux
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend/fork_lm
npm run dev
```

Then open **http://localhost:5173**.

## API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Available Scripts

### Root scripts

| Script | Purpose |
|--------|---------|
| `.\setup.ps1` | Create venv, install deps, init database |
| `.\dev-run.ps1` | Launch backend + frontend |
| `python reset_db.py` | Drop and recreate all tables |

### Backend (in `backend/` with venv active)

```bash
uvicorn backend.main:app --reload
```

### Frontend (in `frontend/fork_lm/`)

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Database Models

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer | Primary key |
| `email` | String | User email |
| `gemini_api_key` | String? | Optional stored key |

### Chat
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (UUID) | Primary key |
| `user_id` | Integer FK → User | Owner |
| `title` | Text? | Chat name |
| `created_at` | Datetime | Auto-generated |

### Node
| Field | Type | Notes |
|-------|------|-------|
| `id` | String (UUID) | Primary key |
| `chat_id` | String FK → Chat | Parent chat |
| `user_id` | Integer FK → User | Owner |
| `parent_id` | String FK → Node? | Self-referencing parent |
| `token` | Integer | Per-chat counter |
| `path` | Text | Hierarchical path (e.g. `/0/1/3`) |
| `prompt` | Text | User input |
| `response` | Text? | LLM response |
| `summary` | Text? | Auto-generated checkpoint summary |
| `depth` | Integer | Depth in tree |
| `created_at` | Datetime | Auto-generated |

## Troubleshooting

### Build failures for `cryptography` / `pydantic-core` / `maturin`

These packages use the `maturin` Rust build backend. The pre-built wheels on PyPI require the standard `win_amd64` platform tag. **If you are using MSYS2 / Cygwin Python**, pip will fail to match the wheel and attempt a source build, which will fail with:

```
Python reports SOABI: cpython-311
Unsupported platform: 311
```

**Fix**: Install a standard Python from [python.org](https://www.python.org/downloads/) and recreate the venv with it.

### Virtual Environment Issues

If the venv is broken, recreate it:

```powershell
Remove-Item -Recurse -Force backend\ForkVenv
python -m venv backend\ForkVenv
backend\ForkVenv\Scripts\activate
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

### Port Already in Use

**Backend**:
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
# Then update CORS origins in backend/main.py
```

**Frontend** (Vite auto-selects next available):
```bash
npm run dev -- --port 5174
```

### Database Issues

If the database becomes corrupted or you want a fresh start:

```powershell
python reset_db.py
```

This drops and recreates all tables in `backend/local.db`.

### Frontend Build Issues

```powershell
cd frontend/fork_lm
Remove-Item -Recurse -Force node_modules
npm install
```

## Development Workflow

1. Start both services (`.dev-run.ps1` or manually)
2. Edit code — Uvicorn auto-reloads the backend, Vite hot-reloads the frontend
3. Test at http://localhost:5173

## Contributing

- Keep commits focused and descriptive
- Test both backend and frontend
- Follow existing code style
- Update documentation as needed

## Future Enhancements

- [ ] User authentication and session management
- [ ] Conversation export (JSON, PDF)
- [ ] Share conversations
- [ ] Search / filter conversations
- [x] Dark mode
- [ ] Mobile-responsive UI
