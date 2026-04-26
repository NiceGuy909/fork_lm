@echo off
REM ============================================
REM ForkLM PostgreSQL Setup Script (Windows)
REM Creates database and user for development
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo    ForkLM PostgreSQL Setup
echo ========================================
echo.

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PostgreSQL is not installed or psql is not in PATH!
    echo.
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL bin directory to your system PATH.
    echo.
    pause
    exit /b 1
)

echo Checking PostgreSQL installation...
psql --version

echo.
echo This script will:
echo   1. Create a PostgreSQL user 'fork_lm' with password 'dev123'
echo   2. Create a database 'fork_lm' owned by the fork_lm user
echo.
echo WARNING: If the user or database already exists, this script will fail.
echo.

REM Get PostgreSQL superuser (usually postgres)
set /p POSTGRES_USER="Enter PostgreSQL superuser (default: postgres): "
if "%POSTGRES_USER%"=="" set POSTGRES_USER=postgres

echo.
echo Connecting as: %POSTGRES_USER%
echo.
echo Enter the PostgreSQL superuser password when prompted...
echo.

REM Create user and database
psql -U %POSTGRES_USER% -h localhost -p 5432 -c "CREATE USER fork_lm WITH PASSWORD 'dev123';"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Warning: Could not create user. It may already exist.
)

psql -U %POSTGRES_USER% -h localhost -p 5432 -c "CREATE DATABASE fork_lm OWNER fork_lm;"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Warning: Could not create database. It may already exist.
)

REM Set permissions
psql -U %POSTGRES_USER% -h localhost -p 5432 -c "ALTER USER fork_lm CREATEDB;"
psql -U %POSTGRES_USER% -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE fork_lm TO fork_lm;"

echo.
echo ========================================
echo     Setup Complete!
echo ========================================
echo.
echo Connection details:
echo   Username: fork_lm
echo   Password: dev123
echo   Database: fork_lm
echo   Host:     localhost
echo   Port:     5432
echo.
echo You can now test the connection with:
echo   psql -U fork_lm -h localhost -d fork_lm
echo.
echo Then run the development environment:
echo   dev-run.bat
echo.
pause
