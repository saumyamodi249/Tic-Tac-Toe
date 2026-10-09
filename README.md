# Triple Loop Tic-Tac-Toe

> *"Three marks. One board. Never stop thinking."*

**Triple Loop Tic-Tac-Toe** is a modern strategy web game that reinvents classic Tic-Tac-Toe into an endless tactical battle.

---

## 🌟 Game Vision & Core Rules

Traditional Tic-Tac-Toe quickly leads to boring, forced stalemates. **Triple Loop** breaks this limitation with a dynamic cycling mechanic:

1. **Standard 3×3 Board**: Played by two players (`X` and `O`).
2. **Three-Mark Maximum**: Each player can have at most **three active marks** on the board at any time.
3. **The Triple Loop Mechanic**:
   - When a player places their **4th mark**, their **oldest active mark (1st)** is automatically removed from the board before the new mark lands.
   - Removal and placement occur in **one atomic logical move**.
4. **No Stalemate Draws**: The board never fills completely (max 6 marks at once). Games continue until a 3-in-a-row alignment is formed or both players agree to a mutual draw.
5. **Winning Conditions**: Complete 3 marks in any horizontal row, vertical column, or diagonal. Win evaluation is calculated on the final board after the oldest mark has vanished.

---

## 🚀 Key Features

* 🎮 **Local Pass & Play**: Two-player games on the same screen with series score tracking.
* 🔑 **Private Room Codes**: Instant 6-character room codes (`e.g., 7K9X2A`) with copy/share actions.
* 🌐 **Global Matchmaking**: Instant matchmaking pool with automated pairing.
* 👤 **Guest & Registered Identities**: Play instantly with a guest nickname, or register/sign in with email.
* ⏱️ **Server-Enforced 30s Reconnection Policy**:
  - If a player temporarily disconnects, an authoritative 30-second countdown is started.
  - Reconnecting restores the authoritative board and cancels the deadline.
  - If the timer expires, the connected player can claim a server-verified forfeit win.
* 🤝 **Mutual Draw Offers**: Propose, accept, or decline draws with synchronized state.
* 🔊 **Web Audio Synthesizer**: Pure Web Audio API synthesized sounds (placements, vanishes, victory fanfare) with instant playback and zero lag.
* 🎨 **Minimalist Premium UI**:
  - Dark Mode & Clean Light Theme.
  - Active mark age badges (`1st`, `2#`, `3#`) and warning pulse on the mark that will vanish next.
  - Confetti victory celebrations.
  - Full keyboard accessibility (Numpad 1–9, Arrow keys, Enter/Space).
  - Reduced-motion accessibility.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
* **Backend**: Supabase (PostgreSQL, Realtime subscriptions, Row Level Security, RPC stored procedures).
* **Audio**: Pure Web Audio API sound synthesizer.
* **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`, JSDOM.

---

## 📁 Project Structure

```
├── public/
│   └── favicon.svg               # SVG brand icon
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx         # Guest nickname & account sign in/up
│   │   ├── Board.tsx             # 3x3 interactive board with numpad support
│   │   ├── Cell.tsx              # Cell with X/O graphics & vanish warning
│   │   ├── DrawDialog.tsx        # Mutual draw proposal and response modal
│   │   ├── HowToPlayModal.tsx    # Interactive rule walkthrough
│   │   ├── Navbar.tsx            # Header, sound & theme toggles, profile
│   │   ├── ScoreBoard.tsx        # Player cards, 3-loop counters & 30s alert
│   │   ├── SettingsModal.tsx     # Audio, theme, and data reset settings
│   │   └── VictoryModal.tsx      # Confetti celebration & rematch controls
│   ├── game/
│   │   ├── engine.ts             # Pure authoritative game engine
│   │   ├── types.ts              # TypeScript domain types & interfaces
│   │   └── winDetection.ts       # 8 winning combination checks
│   ├── lib/
│   │   └── sound.ts              # Synthesized audio engine
│   ├── pages/
│   │   ├── LandingPage.tsx       # Hero showcase & game mode launcher
│   │   ├── LocalGamePage.tsx     # Pass & Play local gameplay
│   │   ├── MatchmakingPage.tsx   # Live radar matchmaking queue
│   │   └── OnlineRoomPage.tsx    # Private room host/join & realtime match
│   ├── services/
│   │   ├── auth.ts               # Guest identity & Supabase auth
│   │   ├── matchmaking.ts        # Matchmaking queue service
│   │   ├── onlineGame.ts         # Supabase RPC & Realtime integration
│   │   └── supabase.ts           # Supabase client singleton
│   ├── test/
│   │   ├── App.test.tsx          # Full integration test suite
│   │   ├── services.test.ts      # Service & auth unit tests
│   │   └── setup.ts              # Vitest test setup
│   ├── App.tsx                   # Main app & view router
│   ├── index.css                 # Design tokens & Tailwind styling
│   └── main.tsx                  # React DOM entry point
├── supabase/
│   └── migrations/
│       └── 20260101000000_triple_loop_schema.sql # Authoritative SQL migration
├── .env.example                  # Environment variable template
└── package.json                  # Dependencies and scripts
```

---

## ⚡ Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Tic-Tac-Toe
npm install
```

### 2. Configure Environment Variables (Optional for Local Play, Required for Online)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*(Note: Local two-player mode and full offline play work out of the box with zero configuration!)*

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Triple Loop includes a comprehensive test suite covering game engine logic, edge cases, move validation, mark removal, win detection, mutual draws, UI components, and authentication.

Run tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Type check and production build:

```bash
npm run build
```

---

## 🗄️ Supabase Backend Setup Guide

To enable live online multiplayer, private rooms, and matchmaking on your Supabase project:

1. **Create a Supabase Project**: Go to [database.new](https://database.new) and create a free project.
2. **Apply Database Migrations**:
   - Open the Supabase **SQL Editor**.
   - Copy the contents of [`supabase/migrations/20260101000000_triple_loop_schema.sql`](file:///c:/Users/saumy/OneDrive/Documents/Tic-Tac-Toe/supabase/migrations/20260101000000_triple_loop_schema.sql).
   - Paste and click **Run**.
3. **Verify Realtime**:
   - In Supabase Dashboard -> **Database** -> **Replication**, ensure `rooms`, `matches`, and `matchmaking_queue` are active.
4. **Copy API Keys**:
   - In Supabase Dashboard -> **Project Settings** -> **API**, copy Project URL and `anon` `public` key into your `.env` or deployment platform.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
5. Click **Deploy**.

---

## 🛡️ Security & Authoritative Logic

* **Server-Enforced Moves**: All online moves are executed atomically via the `submit_online_move` PostgreSQL RPC. Clients cannot forge moves, win states, or skip mark removals.
* **Optimistic Concurrency Control**: Match versions prevent race conditions and duplicate moves.
* **Protected Secrets**: No service-role keys or privileged credentials are included in the frontend code.
* **Row Level Security (RLS)**: Enforced across all tables.

---

## 📄 License

MIT License © 2026 Triple Loop Team.
