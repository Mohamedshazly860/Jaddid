# Database Setup Instructions

## Prerequisites
- PostgreSQL must be installed on your machine
- PostgreSQL service must be running

## Setup Steps

### Option 1: Using pgAdmin (Recommended for Windows)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases"
4. Select "Create" → "Database"
5. Enter database name: `jaddid_db`
6. Click "Save"

### Option 2: Using Command Line
```powershell
# Set PostgreSQL password as environment variable
$env:PGPASSWORD='Hanafy12@'

# Create database using psql
psql -U postgres -h localhost -c "CREATE DATABASE jaddid_db;"
```

### Option 3: Using SQL File
```powershell
# Navigate to the project directory
cd "d:\ARCH\Python Full Stack 2025\Graduation Project\Grad Repo\jaddid-backend"

# Run the SQL file
psql -U postgres -h localhost -f database_setup.sql
```

## Verify Database Connection

After creating the database, test the connection:

```powershell
# Activate virtual environment
.\env\Scripts\Activate.ps1

# Navigate to Django project
cd jaddid

# Test database connection
python manage.py check --database default
```

## Run Migrations

Once the database is created, run migrations:

```powershell
# Create migrations for all apps
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser
```

## Database Credentials

Current configuration (from .env file):
- **Database Name**: jaddid_db
- **User**: postgres
- **Password**: Hanafy12@
- **Host**: localhost
- **Port**: 5432

⚠️ **Security Note**: For production, create a dedicated database user with limited privileges.
