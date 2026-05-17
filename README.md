# 🏆 2026 World Cup Premium Sweepstake

## 🎬 Live Demo

**https://worldcupsweepstake.app**

A theatrical, mobile-first World Cup sweepstake application to help you and your friends complete a sweepstake draw.

---

## 🤖 Built Entirely by AI

This project was created end-to-end by **Hermes Agent** running a local distilled **Qwen3.5-27b** model — from initial scaffolding to production deployment in under two hours.

### The Stack
- **Frontend:** Next.js 16 (App Router) + React + TypeScript
- **Animations:** Framer Motion (cinematic reveals, slot machines, particle explosions)
- **State Sync:** SWR (short-polling for real-time lobby updates)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Hosting:** Vercel (zero-config production deployment)
- **Styling:** Tailwind CSS + custom theatrical theme

---

## ✨ Features

### Theatrical UI/UX
- **Dark mode primary** with high-contrast gold/neon accents
- **Heavy italicized sports typography** mimicking premium broadcasts
- **Aggressive momentum animations** — card flips, explosive reveals, smooth ease-in-out
- **Mobile-first ergonomics** designed for one-handed thumb interaction

### Core Experience

**Phase A: The Hype Lobby** 🏟️
- Dynamic player counter with live arrivals ticker
- Ambient hype background audio with mute toggle
- Short-polling synchronization (2s intervals)

**Phase B: The Main Event** 🎰
- **The Tease:** High-velocity slot machine cycling through player names
- **The Pick:** Dramatic selector landing on a specific player
- **The Reveal:** FUT pack-style black-out with ambient glow, video/audio sync, massive stylized text overlay
- **The Dashboard:** Newly assigned country crest placed next to player name

**Phase C: Contextual Review** 📊
- Tap completed cards for team metadata (World Cup history, winning odds)
- Pulsing "Return to Live Draw" FAB during active cycling
- One-click export to emoji-enriched WhatsApp/Email format

### Technical Highlights
- **Deterministic seeded PRNG** — every connected client sees identical reveal order
- **Seamless reconnection** — return to a completed room and see final results instantly
- **48 World Cup 2026 teams** pre-configured with country codes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Application                     │   │
│  │  ┌──────────────┐  ┌──────────────────────────────┐ │   │
│  │  │  Static      │  │  API Routes (Server Actions) │ │   │
│  │  │  Pages       │  │  /api/room/*                 │ │   │
│  │  └──────────────┘  └──────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  PostgreSQL    │         │  Row Level       │           │
│  │  Database      │◄────────┤  Security        │           │
│  │                │         │  Policies        │           │
│  └────────────────┘         └──────────────────┘           │
│                                                            │
│  Tables: sessions, players                                 │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
sessions:
  - id (UUID, PK)
  - room_code (VARCHAR, unique, 4-6 chars)
  - host_id (VARCHAR)
  - target_players (INT, default 4)
  - seed (DOUBLE PRECISION, for deterministic RNG)
  - status (ENUM: WAITING, DRAWING, COMPLETED)
  - created_at (TIMESTAMP)

players:
  - id (UUID, PK)
  - session_id (UUID, FK → sessions)
  - name (VARCHAR)
  - assigned_team (VARCHAR, nullable)
  - joined_at (TIMESTAMP)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project

### 1. Clone & Install
```bash
git clone https://github.com/lewis-king/sweepstake
cd sweepstake
npm install
```

### 2. Set Up Supabase

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TYPE session_status AS ENUM ('WAITING', 'DRAWING', 'COMPLETED');

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id VARCHAR(255) NOT NULL,
    target_players INTEGER NOT NULL DEFAULT 4,
    seed DOUBLE PRECISION NOT NULL,
    status session_status DEFAULT 'WAITING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    assigned_team VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_room_code ON sessions(room_code);
CREATE INDEX idx_players_session_id ON players(session_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all session operations" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all player operations" ON players FOR ALL USING (true) WITH CHECK (true);
```

### 3. Configure Environment

```bash
# Create .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── room/
│   │       ├── route.ts           # POST: Create room
│   │       ├── [roomId]/
│   │       │   ├── route.ts       # GET/PATCH: Room CRUD
│   │       │   └── assign/        # POST: Save assignments
│   │       └── code/[roomCode]/   # GET: Resolve code → ID
│   ├── globals.css                # Theatrical theme
│   ├── layout.tsx
│   └── page.tsx                   # Main UI
├── hooks/
│   └── useRoom.ts                 # SWR hooks for room state
├── lib/
│   ├── seeded-random.ts           # Mulberry32 PRNG + 48 teams
│   └── supabase-client.ts         # Supabase client wrapper
├── prisma/
│   └── schema.prisma              # Original schema (migrated to Supabase)
└── package.json
```

---

## 🎨 Design Philosophy

### Anti-AI Slop Manifesto
This project explicitly avoids:
- Generic Tailwind templates
- Standard purple/indigo gradients
- Basic dashboard layouts
- Robotic, corporate UI patterns

Instead, it embraces:
- **Gritty, premium sports-broadcast aesthetics**
- **High-contrast neon/gold accents**
- **Heavy italicized sports typography**
- **Cinematic momentum and theatrical reveals**

---

## 🙏 Credits

- **Built by:** Hermes Agent + Qwen3.5-27b (local, distilled)
- **Time to production:** ~2 hours
- **Inspired by:** FIFA Ultimate Team pack openings, premium sports broadcasts

---

## 📄 License

MIT — Feel free to use this for your own World Cup sweepstakes!

---

**Happy watching! ⚽🌍**
