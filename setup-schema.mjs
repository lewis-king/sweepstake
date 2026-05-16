
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rpuftavykzgwfuipkdpy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWZ0YXZ5a3pnd2Z1aXBrZHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTg2OTIsImV4cCI6MjA5NDUzNDY5Mn0.wAWAyE8vOHwNLIykYDuUp4TgRpUtoNGQF9YdUC6Sr7k";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Testing Supabase connection...");

const { data, error } = await supabase.from("sessions").select("*");

if (error) {
  console.log("Table does not exist yet. Schema SQL:");
  console.log(`
-- Run this in Supabase SQL Editor
CREATE TYPE IF NOT EXISTS session_status AS ENUM ('WAITING', 'DRAWING', 'COMPLETED');

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(10) UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  target_players INTEGER NOT NULL,
  seed DOUBLE PRECISION NOT NULL,
  status session_status DEFAULT 'WAITING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  assigned_team TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);
} else {
  console.log("Table exists! Data:", data);
}
