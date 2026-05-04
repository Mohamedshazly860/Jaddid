-- PostgreSQL Database Setup Script for Jaddid Project
-- Run this script to create the database for the project

-- Create the database
CREATE DATABASE jaddid_db;

-- Connect to the database (if running in psql)
\c jaddid_db;

-- Optional: Create a dedicated user for the project (recommended for production)
-- CREATE USER jaddid_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE jaddid_db TO jaddid_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jaddid_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO jaddid_user;

-- Verify the database was created
SELECT current_database();
