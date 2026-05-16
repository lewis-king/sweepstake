-- World Cup Sweepstake Schema for Supabase
-- Run this in the Supabase SQL Editor: https://app.supabase.com/project/rpuftavykzgwfuipkdpy/sql

-- Create enum for session status
CREATE TYPE IF NOT EXISTS session_status AS ENUM ('WAITING', 'DRAWING', 'COMPLETED');

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(10) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  target_players INTEGER NOT NULL CHECK (target_players >= 2 AND target_players <= 48),
  seed DOUBLE PRECISION NOT NULL,
  status session_status DEFAULT 'WAITING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table  
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_team TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(session_id);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access
-- Note: For production, you may want more restrictive policies

CREATE POLICY "Allow public read access to sessions" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on sessions" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on sessions" ON sessions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on sessions" ON sessions
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on players" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on players" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on players" ON players
  FOR DELETE USING (true);
