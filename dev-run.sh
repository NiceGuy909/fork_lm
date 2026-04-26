#!/bin/bash

# ============================================
# ForkLM Development Auto-Run Script (macOS/Linux)
# Runs both backend (FastAPI) and frontend (Vite)
# ============================================

set -e

echo ""
echo "========================================"
echo "    ForkLM Development Environment"
echo "========================================"
echo ""

# Check if required directories exist
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found!"
    echo "Please run this script from the ForkLM root directory."
    exit 1
fi

if [ ! -d "frontend/fork_lm" ]; then
    echo "Error: frontend/fork_lm directory not found!"
    echo "Please run this script from the ForkLM root directory."
    exit 1
fi

echo "Starting ForkLM services..."
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "Services stopped."
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start Backend
echo "[1/2] Starting Backend (FastAPI on http://localhost:8000)..."
(
    cd backend
    source ForkVenv/bin/activate
    echo ""
    echo "Backend server is starting..."
    echo "API Docs: http://localhost:8000/docs"
    echo ""
    uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
) &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo "[2/2] Starting Frontend (Vite on http://localhost:5173)..."
(
    cd frontend/fork_lm
    echo ""
    echo "Frontend development server is starting..."
    echo "App: http://localhost:5173"
    echo ""
    npm run dev
) &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Display summary
echo ""
echo "========================================"
echo "     Services Started!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Services running in background:"
echo "  - Backend (PID: $BACKEND_PID): FastAPI with auto-reload"
echo "  - Frontend (PID: $FRONTEND_PID): Vite development server"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
