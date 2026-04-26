# ============================================
# ForkLM Development Auto-Run Script (PowerShell)
# Runs both backend (FastAPI) and frontend (Vite)
# ============================================

Write-Host ""
Write-Host "========================================"
Write-Host "    ForkLM Development Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if required directories exist
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the ForkLM root directory."
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "frontend\fork_lm")) {
    Write-Host "Error: frontend\fork_lm directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the ForkLM root directory."
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting ForkLM services..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting Backend (FastAPI on http://localhost:8000)..." -ForegroundColor Green
$backendScript = {
    & .\backend\ForkVenv\Scripts\Activate.ps1
    Write-Host ""
    Write-Host "Backend server is starting..." -ForegroundColor Green
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    & uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
}

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript -PassThru
Write-Host "Backend started (PID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "[2/2] Starting Frontend (Vite on http://localhost:5173)..." -ForegroundColor Green
$frontendScript = {
    Set-Location frontend\fork_lm
    Write-Host ""
    Write-Host "Frontend development server is starting..." -ForegroundColor Green
    Write-Host "App: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    & npm run dev
}

$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript -PassThru
Write-Host "Frontend started (PID: $($frontendJob.Id))" -ForegroundColor Green

# Display summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Services Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Two new PowerShell windows have been opened:" -ForegroundColor Yellow
Write-Host "  - Backend terminal: Running FastAPI with auto-reload"
Write-Host "  - Frontend terminal: Running Vite development server"
Write-Host ""
Write-Host "Press Ctrl+C in either terminal to stop that service." -ForegroundColor Yellow
Write-Host "Close the terminal windows when done." -ForegroundColor Yellow
Write-Host ""

# Wait for user to close this window
Read-Host "Press Enter to exit"
