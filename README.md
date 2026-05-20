     1|# 🏆 2026 World Cup Premium Sweepstake
     2|
     3|## 🎬 Live Demo
     4|
     5|**https://worldcupsweepstake.app**
     6|
     7|A theatrical, mobile-first World Cup sweepstake application to help you and your friends complete a sweepstake draw.
     8|
     9|---
    10|
    11|## 🤖 Built Entirely by AI
    12|
    13|This project was created end-to-end by **Hermes Agent** running a local distilled **Qwen3.5-27b** model — from initial scaffolding to production deployment in under two hours.
    14|
    15|### The Stack
    16|- **Frontend:** Next.js 16 (App Router) + React + TypeScript
    17|- **Animations:** Framer Motion (cinematic reveals, slot machines, particle explosions)
    18|- **State Sync:** SWR (short-polling for real-time lobby updates)
    19|- **Database:** Supabase (PostgreSQL with Row Level Security)
    20|- **Hosting:** Vercel (zero-config production deployment)
    21|- **Styling:** Tailwind CSS + custom theatrical theme
    22|
    23|---
    24|
    25|## ✨ Features
    26|
    27|### Theatrical UI/UX
    28|- **Dark mode primary** with high-contrast gold/neon accents
    29|- **Heavy italicized sports typography** mimicking premium broadcasts
    30|- **Aggressive momentum animations** — card flips, explosive reveals, smooth ease-in-out
    31|- **Mobile-first ergonomics** designed for one-handed thumb interaction
    32|
    33|### Core Experience
    34|
    35|**Phase A: The Hype Lobby** 🏟️
    36|- Dynamic player counter with live arrivals ticker
    37|- Ambient hype background audio with mute toggle
    38|- Short-polling synchronization (2s intervals)
    39|
    40|**Phase B: The Main Event** 🎰
    41|- **The Tease:** High-velocity slot machine cycling through player names
    42|- **The Pick:** Dramatic selector landing on a specific player
    43|- **The Reveal:** FUT pack-style black-out with ambient glow, video/audio sync, massive stylized text overlay
    44|- **The Dashboard:** Newly assigned country crest placed next to player name
    45|
    46|**Phase C: Contextual Review** 📊
    47|- Tap completed cards for team metadata (World Cup history, winning odds)
    48|- Pulsing "Return to Live Draw" FAB during active cycling
    49|- One-click export to emoji-enriched WhatsApp/Email format
    50|
    51|### Technical Highlights
    52|- **Deterministic seeded PRNG** — every connected client sees identical reveal order
    53|- **Fair tiered distribution algorithm** — balanced quality across all players (see below)
    54|- **Seamless reconnection** — return to a completed room and see final results instantly
    55|- **48 World Cup 2026 teams** pre-configured with country codes and betting odds
    56|
    57|---
    58|
    59|## 🎲 The Seeded Drawing Algorithm
    60|
    61|The sweepstake uses a sophisticated **two-phase tiered distribution algorithm** to ensure every participant gets a fun, balanced mix of teams — no one gets all the favorites or all the underdogs.
    62|
    63|### Why Tiered?
    64|
    65|A naive random shuffle would often result in unfair distributions:
    66|- One person gets Brazil, Spain, France, England (all favorites)
    67|- Another gets Qatar, Saudi Arabia, Panama, Jamaica (all underdogs)
    68|
    69|This creates a poor experience — the first person wins everything, the second wins nothing.
    70|
    71|### How It Works
    72|
    73|#### Step 1: Team Tiering
    74|
    75|All 48 teams are sorted by their World Cup winning odds into **4 tiers of 12 teams**:
    76|
    77|| Tier | Description | Example Teams |
    78||------|-------------|---------------|
    79|| **Tier 1** | Heavy favorites (shortest odds) | Spain (4/1), France (9/2), England (11/2) |
    80|| **Tier 2** | Strong contenders | Brazil (8/1), Argentina (17/2), Portugal (10/1) |
    81|| **Tier 3** | Mid-table / dark horses | Japan (14/1), Morocco (16/1), Ukraine (20/1) |
    82|| **Tier 4** | Underdogs (longest odds) | Jamaica (100/1), Panama (150/1), Qatar (500/1) |
    83|
    84|#### Step 2: Seeded Shuffling
    85|
    86|Using a **Mulberry32 PRNG** seeded from the room creation timestamp:
    87|- Players are shuffled into a random order (prevents first-joiner advantage)
    88|- Teams within each tier are shuffled randomly
    89|
    90|This ensures **deterministic fairness** — the same seed always produces the same result, and all connected clients see identical outcomes.
    91|
    92|#### Step 3: Two-Phase Distribution
    93|
    94|**Phase 1 — Tier Coverage:** Each player receives exactly **one team from each tier** (4 teams per player).
    95|
    96|```
    97|Player 1: [Tier 1] [Tier 2] [Tier 3] [Tier 4]
    98|Player 2: [Tier 1] [Tier 2] [Tier 3] [Tier 4]
    99|Player 3: [Tier 1] [Tier 2] [Tier 3] [Tier 4]
   100|...
   101|```
   102|
   103|**Phase 2 — Round-Robin Remainder:** The remaining 4 teams per player (20 teams total) are distributed round-robin.
   104|
   105|```
   106|Player 1: +[Tier ?] +[Tier ?] +[Tier ?] +[Tier ?]
   107|Player 2: +[Tier ?] +[Tier ?] +[Tier ?] +[Tier ?]
   108|...
   109|```
   110|
   111|### The Result
   112|
   113|With 10 players and 48 teams:
   114|- **Every player gets 4-5 teams** (no one gets 3 or 6)
   115|- **Every player has at least one team from each tier** (guaranteed tier coverage)
   116|- **Remaining teams are mixed tiers** (some players get extra favorites, some get extra underdogs — but everyone has a shot)
   117|
   118|### Example Output (10 players)
   119|
   120|```
   121|1. Lewis:     🇪🇸 Spain (4/1), 🇧🇷 Brazil (8/1), 🇯🇵 Japan (14/1), 🇯🇲 Jamaica (100/1)...
   122|2. Sarah:     🇫🇷 France (9/2), 🇦🇷 Argentina (17/2), 🇲🇦 Morocco (16/1), 🇵🇦 Panama (150/1)...
   123|3. Mike:      🇬🇧 England (11/2), 🇵🇹 Portugal (10/1), 🇺🇦 Ukraine (20/1), 🇶🇦 Qatar (500/1)...
   124|...
   125|```
   126|
   127|Each player has a realistic path to winning multiple games while maintaining excitement throughout the tournament.
   128|
   129|### Fairness Verification
   130|
   131|The algorithm passes rigorous fairness tests:
   132|- ✅ Equal distribution (everyone gets 4-5 teams with 10 players)
   133|- ✅ Tier coverage (everyone has at least one team per tier)
   134|- ✅ Deterministic (same seed = same results, every time)
   135|- ✅ No first-joiner advantage (players shuffled by seed)
   136|
   137|---
   138|
   139|## 🏗️ Architecture
   140|
   141|```
   142|┌─────────────────────────────────────────────────────────────┐
   143|│                    Vercel Edge Network                       │
   144|│  ┌─────────────────────────────────────────────────────┐   │
   145|│  │              Next.js Application                     │   │
   146|│  │  ┌──────────────┐  ┌──────────────────────────────┐ │   │
   147|│  │  │  Static      │  │  API Routes (Server Actions) │ │   │
   148|│  │  │  Pages       │  │  /api/room/*                 │ │   │
   149|│  │  └──────────────┘  └──────────────────────────────┘ │   │
   150|│  └─────────────────────────────────────────────────────┘   │
   151|└─────────────────────────────────────────────────────────────┘
   152|                           │
   153|                           ▼
   154|┌─────────────────────────────────────────────────────────────┐
   155|│                      Supabase                               │
   156|│  ┌────────────────┐         ┌──────────────────┐           │
   157|│  │  PostgreSQL    │         │  Row Level       │           │
   158|│  │  Database      │◄────────┤  Security        │           │
   159|│  │                │         │  Policies        │           │
   160|│  └────────────────┘         └──────────────────┘           │
   161|│                                                            │
   162|│  Tables: sessions, players                                 │
   163|└─────────────────────────────────────────────────────────────┘
   164|```
   165|
   166|### Database Schema
   167|
   168|```sql
   169|sessions:
   170|  - id (UUID, PK)
   171|  - room_code (VARCHAR, unique, 4-6 chars)
   172|  - host_id (VARCHAR)
   173|  - target_players (INT, default 4)
   174|  - seed (DOUBLE PRECISION, for deterministic RNG)
   175|  - status (ENUM: WAITING, DRAWING, DRAW_COMPLETED)
   176|  - created_at (TIMESTAMP)
   177|
   178|players:
   179|  - id (UUID, PK)
   180|  - session_id (UUID, FK → sessions)
   181|  - name (VARCHAR)
   182|  - assigned_team (VARCHAR, nullable)
   183|  - joined_at (TIMESTAMP)
   184|```
   185|
   186|---
   187|
   188|## 🚀 Quick Start
   189|
   190|### Prerequisites
   191|- Node.js 18+
   192|- A Supabase project
   193|
   194|### 1. Clone & Install
   195|```bash
   196|git clone https://github.com/lewis-king/sweepstake
   197|cd sweepstake
   198|npm install
   199|```
   200|
   201|### 2. Set Up Supabase
   202|
   203|Run this SQL in your Supabase SQL Editor:
   204|
   205|```sql
   206|CREATE TYPE session_status AS ENUM ('WAITING', 'DRAWING', 'DRAW_COMPLETED');
   207|
   208|CREATE TABLE sessions (
   209|    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   210|    room_code VARCHAR(10) UNIQUE NOT NULL,
   211|    host_id VARCHAR(255) NOT NULL,
   212|    target_players INTEGER NOT NULL DEFAULT 4,
   213|    seed DOUBLE PRECISION NOT NULL,
   214|    status session_status DEFAULT 'WAITING',
   215|    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   216|);
   217|
   218|CREATE TABLE players (
   219|    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   220|    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
   221|    name VARCHAR(255) NOT NULL,
   222|    assigned_team VARCHAR(100),
   223|    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   224|);
   225|
   226|CREATE INDEX idx_sessions_room_code ON sessions(room_code);
   227|CREATE INDEX idx_players_session_id ON players(session_id);
   228|
   229|ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
   230|ALTER TABLE players ENABLE ROW LEVEL SECURITY;
   231|
   232|CREATE POLICY "Allow all session operations" ON sessions FOR ALL USING (true) WITH CHECK (true);
   233|CREATE POLICY "Allow all player operations" ON players FOR ALL USING (true) WITH CHECK (true);
   234|```
   235|
   236|### 3. Configure Environment
   237|
   238|```bash
   239|# Create .env.local
   240|NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   241|NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   242|```
   243|
   244|### 4. Run Development Server
   245|```bash
   246|npm run dev
   247|```
   248|
   249|Open [http://localhost:3000](http://localhost:3000)
   250|
   251|---
   252|
   253|## 📁 Project Structure
   254|
   255|```
   256|├── app/
   257|│   ├── api/
   258|│   │   └── room/
   259|│   │       ├── route.ts           # POST: Create room
   260|│   │       ├── [roomId]/
   261|│   │       │   ├── route.ts       # GET/PATCH: Room CRUD
   262|│   │       │   └── assign/        # POST: Save assignments
   263|│   │       └── code/[roomCode]/   # GET: Resolve code → ID
   264|│   ├── globals.css                # Theatrical theme
   265|│   ├── layout.tsx
   266|│   └── page.tsx                   # Main UI
   267|├── hooks/
   268|│   └── useRoom.ts                 # SWR hooks for room state
   269|├── lib/
   270|│   ├── seeded-random.ts           # Mulberry32 PRNG + 48 teams
   271|│   └── supabase-client.ts         # Supabase client wrapper
   272|├── prisma/
   273|│   └── schema.prisma              # Original schema (migrated to Supabase)
   274|└── package.json
   275|```
   276|
   277|---
   278|
   279|## 🎨 Design Philosophy
   280|
   281|### Anti-AI Slop Manifesto
   282|This project explicitly avoids:
   283|- Generic Tailwind templates
   284|- Standard purple/indigo gradients
   285|- Basic dashboard layouts
   286|- Robotic, corporate UI patterns
   287|
   288|Instead, it embraces:
   289|- **Gritty, premium sports-broadcast aesthetics**
   290|- **High-contrast neon/gold accents**
   291|- **Heavy italicized sports typography**
   292|- **Cinematic momentum and theatrical reveals**
   293|
   294|---
   295|
   296|## 🙏 Credits
   297|
   298|- **Built by:** Hermes Agent + Qwen3.5-27b (local, distilled)
   299|- **Time to production:** ~2 hours
   300|- **Inspired by:** FIFA Ultimate Team pack openings, premium sports broadcasts
   301|