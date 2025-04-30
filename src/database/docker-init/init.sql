-- Docker initialization script
-- This script runs when the PostgreSQL container is first created

-- Connect to the mailbuddybot database
\c mailbuddybot;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR(255) PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "last_message_timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS "reminders" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL REFERENCES users(id),
    "channel_id" VARCHAR(255) NOT NULL,
    "reminder_text" TEXT NOT NULL,
    "due_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create command logs table
CREATE TABLE IF NOT EXISTS "command_logs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "command" VARCHAR(255) NOT NULL,
    "args" TEXT,
    "guild_id" VARCHAR(255),
    "channel_id" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_at ON reminders(due_at);
CREATE INDEX IF NOT EXISTS idx_command_logs_user_id ON command_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_command ON command_logs(command);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres; 