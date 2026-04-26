@echo off
REM ============================================
REM ForkLM Development Auto-Run Script
REM Runs both backend (FastAPI) and frontend (Vite)
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo    ForkLM Development Environment
echo ========================================
echo.

REM Check if required directories exist
if not exist "backend\" (
    echo Error: backend directory not found!
    echo Please run this script from the ForkLM root directory.
    pause
    exit /b 1
)

if not exist "frontend\fork_lm\" (
    echo Error: frontend\fork_lm directory not found!
    echo Please run this script from the ForkLM root directory.
    pause
    exit /b 1
)

REM Colors for output
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

echo Starting ForkLM services...
echo.

REM Start Backend
echo [1/2] Starting Backend (FastAPI on http://localhost:8000)...
start "ForkLM Backend" cmd /k "cd backend && ForkVenv\Scripts\activate && echo. && echo Backend server is starting... && echo API Docs: http://localhost:8000/docs && echo. && uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start Frontend
echo [2/2] Starting Frontend (Vite on http://localhost:5173)...
start "ForkLM Frontend" cmd /k "cd frontend\fork_lm && echo. && echo Frontend development server is starting... && echo App: http://localhost:5173 && echo. && npm run dev"

echo.
echo ========================================
echo     Services Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Two new terminal windows have been opened:
echo   - Backend terminal: Running FastAPI with auto-reload
echo   - Frontend terminal: Running Vite development server
echo.
echo Press Ctrl+C in either terminal to stop that service.
echo Close the terminal windows when done.
echo.
pause
