-- Initialize PostgreSQL database for Piloo.ai
-- This script creates necessary extensions and initial setup

-- Create database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS piloo_production;
-- CREATE DATABASE IF NOT EXISTS piloo_dev;
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'piloo_production'
   ) THEN
      CREATE DATABASE piloo_production;
   END IF;
END
$$;

DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database WHERE datname = 'piloo_dev'
   ) THEN
      CREATE DATABASE piloo_dev;
   END IF;
END
$$;


-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create application user if it doesn't exist
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'piloo_user') THEN
      CREATE USER piloo_user WITH PASSWORD 'secure_password_change_in_production';
   END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE piloo_production TO piloo_user;
GRANT ALL PRIVILEGES ON DATABASE piloo_dev TO piloo_user;
