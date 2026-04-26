# ============================================
# ForkLM PostgreSQL Setup Script (PowerShell)
# Creates database and user for development
# ============================================

Write-Host ""
Write-Host "========================================"
Write-Host "    ForkLM PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlCheck = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCheck) {
    Write-Host "Error: PostgreSQL is not installed or psql is not in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Make sure to add PostgreSQL bin directory to your system PATH."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking PostgreSQL installation..." -ForegroundColor Green
psql --version
Write-Host ""

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Create a PostgreSQL user 'fork_lm' with password 'dev123'"
Write-Host "  2. Create a database 'fork_lm' owned by the fork_lm user"
Write-Host "  3. Set proper permissions"
Write-Host ""
Write-Host "WARNING: If the user or database already exists, those steps will fail." -ForegroundColor Yellow
Write-Host ""

# Get PostgreSQL superuser
$postgresUser = Read-Host "Enter PostgreSQL superuser (default: postgres)"
if ([string]::IsNullOrWhiteSpace($postgresUser)) {
    $postgresUser = "postgres"
}

Write-Host ""
Write-Host "Connecting as: $postgresUser" -ForegroundColor Green
Write-Host "Enter the PostgreSQL superuser password when prompted..." -ForegroundColor Yellow
Write-Host ""

# Create user
Write-Host "Creating user 'fork_lm'..." -ForegroundColor Green
psql -U $postgresUser -h localhost -p 5432 -c "CREATE USER fork_lm WITH PASSWORD 'dev123';" 2>&1 | ForEach-Object {
    if ($_ -match "already exists") {
        Write-Host "Note: User already exists" -ForegroundColor Yellow
    } else {
        Write-Host $_
    }
}

# Create database
Write-Host "Creating database 'fork_lm'..." -ForegroundColor Green
psql -U $postgresUser -h localhost -p 5432 -c "CREATE DATABASE fork_lm OWNER fork_lm;" 2>&1 | ForEach-Object {
    if ($_ -match "already exists") {
        Write-Host "Note: Database already exists" -ForegroundColor Yellow
    } else {
        Write-Host $_
    }
}

# Set permissions
Write-Host "Setting permissions..." -ForegroundColor Green
psql -U $postgresUser -h localhost -p 5432 -c "ALTER USER fork_lm CREATEDB;" 2>&1 | Out-Null
psql -U $postgresUser -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE fork_lm TO fork_lm;" 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================"
Write-Host "     Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Connection details:" -ForegroundColor Cyan
Write-Host "  Username: fork_lm"
Write-Host "  Password: dev123"
Write-Host "  Database: fork_lm"
Write-Host "  Host:     localhost"
Write-Host "  Port:     5432"
Write-Host ""
Write-Host "Test the connection with:" -ForegroundColor Yellow
Write-Host "  psql -U fork_lm -h localhost -d fork_lm"
Write-Host ""
Write-Host "Then run the development environment:" -ForegroundColor Yellow
Write-Host "  .\dev-run.ps1"
Write-Host ""

Read-Host "Press Enter to exit"
