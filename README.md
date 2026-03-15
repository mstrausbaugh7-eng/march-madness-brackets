# 🏀 March Madness 2026 — Family Bracket Challenge

A fast, mobile-friendly bracket game for your family. Built with React + Vite, hosted free on GitHub Pages, powered by Supabase.

---

## Setup (20 minutes total)

### 1. Supabase Database (5 min)

1. Go to [supabase.com](https://supabase.com) → create a free account
2. Create a new project (name it anything, remember the database password)
3. Once created, go to **SQL Editor** and run this:

sql
-- Players
create table players (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp default now()
);

-- Picks
create table picks (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id) on delete cascade,
  round int not null,
  slot int not null,
  team text not null,
  created_at timestamp default now(),
  unique(player_id, round, slot)
);

-- Results (you fill these in as games are played)
create table results (
  id uuid default gen_random_uuid() primary key,
  round int not null,
  slot int not null,
  winner text,
  updated_at timestamp default now(),
  unique(round, slot)
);

-- Row Level Security (allow all for family use)
alter table players enable row level security;
alter table picks enable row level security;
alter table results enable row level security;

create policy "Allow all" on players for all using (true) with check (true);
create policy "Allow all" on picks for all using (true) with check (true);
create policy "Allow all" on results for all using (true) with check (true);


4. Go to **Settings → API** and copy:
   - **Project URL** → your `VITE_SUPABASE_URL`
   - **anon / public key** → your `VITE_SUPABASE_ANON_KEY`



### 2. Configure the App (2 min)

bash
cp .env.example .env.local


Edit `.env.local` and paste your Supabase values.

---

### 3. GitHub Pages Deploy (10 min)

1. Create a new GitHub repo (e.g. `march-madness-brackets`)
2. In `vite.config.js`, update the base path to match your repo name:
   js
   base: '/march-madness-brackets/',  // ← your repo name here
   
3. In `package.json`, update the homepage if needed
4. Push code to GitHub:
   bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/march-madness-brackets.git
   git push -u origin main
   
5. Install dependencies and deploy:
   bash
   npm install
   npm run deploy
   
6. In GitHub: **Settings → Pages** → set source to `gh-pages` branch

Your app will be live at:
`https://YOUR_USERNAME.github.io/march-madness-brackets/`

---

## Running Locally

bash
npm install
npm run dev


---

## How to Use

### Family Members
1. Visit the URL
2. Enter your name to create your bracket and enter the family code
3. Pick winners for each round — start with Round of 64, work through to the Championship
4. Hit **Save Picks** when done
5. Picks can be updated any time before the tournament starts - locks on 19 March at noon EDT

### You (Admin)
1. On the home page, click the small dot `●` in the footer **5 times** to unlock Admin mode
2. An "Admin" tab will appear in the nav
3. After each game, go to Admin → select the round → click the winning team
4. Hit **Save Results** — everyone's scores update automatically

---

## Scoring
| Round | Points |
|-------|--------|
| Round of 64 | 1 pt |
| Round of 32 | 2 pts |
| Sweet 16 | 4 pts |
| Elite Eight | 8 pts |
| Final Four | 16 pts |
| Championship | 32 pts |
| **Max possible** | **192 pts** |

---

## Tech Stack
- **React + Vite** — fast, modern frontend
- **Supabase** — free Postgres database with auto-generated API
- **GitHub Pages** — free static hosting
- **No server required**

---

## Customizing Teams
Edit `src/lib/teams.js` to update the bracket with the actual 2026 tournament seedings when they're announced on Selection Sunday (March 15).
