import psycopg2
from psycopg2 import sql
import os

# Database connection settings from Django
DB_NAME = os.getenv('DB_NAME', 'jaddid_db')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("🔧 Fixing date_joined column type...")
    
    # Fix the column type
    cursor.execute("""
        ALTER TABLE accounts_user 
        ALTER COLUMN date_joined TYPE timestamp with time zone 
        USING CASE 
            WHEN date_joined::text IN ('true', 'false') THEN current_timestamp 
            ELSE date_joined::timestamp with time zone 
        END;
    """)
    
    print("✅ Column type fixed successfully!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nℹ️  Please run this SQL manually in pgAdmin or psql:")
    print("""
    ALTER TABLE accounts_user 
    ALTER COLUMN date_joined TYPE timestamp with time zone 
    USING CASE 
        WHEN date_joined::text IN ('true', 'false') THEN current_timestamp 
        ELSE date_joined::timestamp with time zone 
    END;
    """)
