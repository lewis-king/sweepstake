# Deployment Guide

## Step 1: Set Up Supabase Database

1. Go to your Supabase project: https://app.supabase.com/project/rpuftavykzgwfuipkdpy
2. Navigate to the SQL Editor
3. Run the schema migration file: `supabase-schema.sql`

Copy and paste this into the SQL Editor:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_room_code ON sessions(room_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(session_id);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public access to sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to players" ON players FOR ALL USING (true) WITH CHECK (true);
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `lewis-king/sweepstake`
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rpuftavykzgwfuipkdpy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWZ0YXZ5a3pnd2Z1aXBrZHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTg2OTIsImV4cCI6MjA5NDUzNDY5Mn0.wAWAyE8vOHwNLIykYDuUp4TgRpUtoNGQF9YdUC6Sr7k
   ```

5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link --repo
vercel deploy --prod
```

## Step 3: Test Your Deployment

1. Open your Vercel deployment URL
2. Create a new room
3. Test the sweepstake functionality

## Free Tier Limits

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited projects
- Automatic HTTPS
- Serverless functions: 100GB-hrs/month

**Supabase Free Tier:**
- 500MB database
- 2GB bandwidth/month
- 10,000 monthly active users
- Unlimited API requests

These limits should be more than enough for occasional World Cup sweepstakes!
