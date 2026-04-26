#!/bin/bash

# ============================================
# ForkLM PostgreSQL Setup Script (macOS/Linux)
# Creates database and user for development
# ============================================

echo ""
echo "========================================"
echo "    ForkLM PostgreSQL Setup"
echo "========================================"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed or psql is not in PATH!"
    echo ""
    echo "Please install PostgreSQL:"
    echo "  macOS (using Homebrew): brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib"
    echo ""
    exit 1
fi

echo "Checking PostgreSQL installation..."
psql --version
echo ""

echo "This script will:"
echo "  1. Create a PostgreSQL user 'fork_lm' with password 'dev123'"
echo "  2. Create a database 'fork_lm' owned by the fork_lm user"
echo "  3. Set proper permissions"
echo ""
echo "WARNING: If the user or database already exists, those steps will fail."
echo ""

# Check if PostgreSQL service is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "Warning: PostgreSQL doesn't appear to be running on localhost:5432"
    echo ""
    echo "To start PostgreSQL:"
    echo "  macOS: brew services start postgresql"
    echo "  Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  CentOS/RHEL: sudo systemctl start postgresql"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit..."
fi

# Get PostgreSQL superuser
read -p "Enter PostgreSQL superuser (default: postgres): " POSTGRES_USER
POSTGRES_USER=${POSTGRES_USER:-postgres}

echo ""
echo "Connecting as: $POSTGRES_USER"
echo "Enter the PostgreSQL superuser password when prompted..."
echo ""

# Create user
echo "Creating user 'fork_lm'..."
psql -U "$POSTGRES_USER" -h localhost -p 5432 -c "CREATE USER fork_lm WITH PASSWORD 'dev123';" 2>&1 | grep -v "already exists" || true
if psql -U "$POSTGRES_USER" -h localhost -p 5432 -c "SELECT 1 FROM pg_user WHERE usename = 'fork_lm';" | grep -q 1; then
    echo "✓ User created successfully"
fi

# Create database
echo "Creating database 'fork_lm'..."
psql -U "$POSTGRES_USER" -h localhost -p 5432 -c "CREATE DATABASE fork_lm OWNER fork_lm;" 2>&1 | grep -v "already exists" || true
if psql -U "$POSTGRES_USER" -h localhost -p 5432 -l | grep -q fork_lm; then
    echo "✓ Database created successfully"
fi

# Set permissions
echo "Setting permissions..."
psql -U "$POSTGRES_USER" -h localhost -p 5432 -c "ALTER USER fork_lm CREATEDB;" &> /dev/null
psql -U "$POSTGRES_USER" -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE fork_lm TO fork_lm;" &> /dev/null
echo "✓ Permissions set"

echo ""
echo "========================================"
echo "     Setup Complete!"
echo "========================================"
echo ""
echo "Connection details:"
echo "  Username: fork_lm"
echo "  Password: dev123"
echo "  Database: fork_lm"
echo "  Host:     localhost"
echo "  Port:     5432"
echo ""
echo "Test the connection with:"
echo "  psql -U fork_lm -h localhost -d fork_lm"
echo ""
echo "Then run the development environment:"
echo "  ./dev-run.sh"
echo ""
