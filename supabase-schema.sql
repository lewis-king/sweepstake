-- World Cup Sweepstake Schema for Supabase
-- Run this in the Supabase SQL Editor: https://app.supabase.com/project/rpuftavykzgwfuipkdpy/sql

-- Create enum for session status
CREATE TYPE session_status AS ENUM ('WAITING', 'DRAWING', 'COMPLETED');

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id VARCHAR(255) NOT NULL,
    target_players INTEGER NOT NULL DEFAULT 4,
    seed DOUBLE PRECISION NOT NULL,
    status session_status DEFAULT 'WAITING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    assigned_team VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_room_code ON sessions(room_code);
CREATE INDEX idx_players_session_id ON players(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Allow all session operations" ON sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for players
CREATE POLICY "Allow all player operations" ON players
    FOR ALL USING (true) WITH CHECK (true);
