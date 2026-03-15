import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project values
// Found at: https://supabase.com/dashboard → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
  ============================================================
  SUPABASE SETUP — Run this SQL in your Supabase SQL Editor:
  ============================================================

  -- Players table
  create table players (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    created_at timestamp default now()
  );

  -- Picks table (one row per player per game slot)
  create table picks (
    id uuid default gen_random_uuid() primary key,
    player_id uuid references players(id) on delete cascade,
    round int not null,         -- 1=R64, 2=R32, 3=S16, 4=E8, 5=F4, 6=Championship
    slot int not null,          -- position in the bracket (0-indexed per round)
    team text not null,
    created_at timestamp default now(),
    unique(player_id, round, slot)
  );

  -- Results table (admin-updated actual winners)
  create table results (
    id uuid default gen_random_uuid() primary key,
    round int not null,
    slot int not null,
    winner text,
    updated_at timestamp default now(),
    unique(round, slot)
  );

  -- Enable Row Level Security (allow all reads, all inserts for now)
  alter table players enable row level security;
  alter table picks enable row level security;
  alter table results enable row level security;

  create policy "Allow all" on players for all using (true) with check (true);
  create policy "Allow all" on picks for all using (true) with check (true);
  create policy "Allow all" on results for all using (true) with check (true);

  ============================================================
*/
