# Auto-setup script for ForkLM on Windows PowerShell
# Creates the backend virtual environment, installs dependencies,
# configures the database, and creates tables.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ForkLM Auto Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Detect Python ---
$systemPython = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $systemPython) {
    Write-Host "Error: Python not found in PATH. Install Python from python.org" -ForegroundColor Red
    exit 1
}

# Warn about MSYS2 Python (known platform-tag incompatibility)
$pyPlatform = & $systemPython -c "import sysconfig; print(sysconfig.get_platform())" 2>$null
if ($pyPlatform -and $pyPlatform -ne "win_amd64" -and $pyPlatform -notlike "win32") {
    Write-Host "Warning: Detected non-standard Python platform: $pyPlatform" -ForegroundColor Yellow
    Write-Host "If you encounter build errors for cryptography/pydantic-core, install Python from python.org." -ForegroundColor Yellow
    Write-Host ""
}

# --- Virtual Environment ---
$venvDir = Join-Path $PSScriptRoot "backend\ForkVenv"

function Get-VenvPython {
    param([string]$venvRoot)
    $candidates = @(
        (Join-Path $venvRoot "Scripts\python.exe")
        (Join-Path $venvRoot "bin\python")
        (Join-Path $venvRoot "python.exe")
    )
    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) { return $candidate }
    }
    return $null
}

$venvPython = Get-VenvPython $venvDir
if (-not $venvPython) {
    Write-Host "Creating virtual environment at backend\ForkVenv..." -ForegroundColor Green
    & $systemPython -m venv $venvDir
    $venvPython = Get-VenvPython $venvDir
    if (-not $venvPython) {
        Write-Host "Error: Failed to create virtual environment." -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created." -ForegroundColor Green
}

# --- Install Dependencies ---
Write-Host "Installing Python dependencies..." -ForegroundColor Green
& $venvPython -m pip install --upgrade pip 2>&1 | Out-Null
& $venvPython -m pip install -r (Join-Path $PSScriptRoot "backend\requirements.txt") 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: pip install had issues. Common fixes:" -ForegroundColor Yellow
    Write-Host "  - Use a standard Python from python.org (not MSYS2)" -ForegroundColor Yellow
    Write-Host "  - See README Troubleshooting section for details" -ForegroundColor Yellow
}

# --- Initialize Database ---
Write-Host "Initializing SQLite database..." -ForegroundColor Green
& $venvPython -c "from backend.db.database import create_db_and_tables; create_db_and_tables()"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Setup Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run the development server with: .\dev-run.ps1" -ForegroundColor Yellow
