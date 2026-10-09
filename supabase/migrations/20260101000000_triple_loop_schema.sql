-- ============================================================================
-- TRIPLE LOOP TIC-TAC-TOE — AUTHORITATIVE DATABASE SCHEMA & STORED FUNCTIONS
-- ============================================================================

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  is_guest boolean not null default true,
  avatar_url text,
  games_played int not null default 0,
  games_won int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. ROOMS TABLE
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid not null,
  host_name text not null,
  guest_id uuid,
  guest_name text,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'closed')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 hours')
);

create index if not exists idx_rooms_code on public.rooms (code);
create index if not exists idx_rooms_status on public.rooms (status);

-- 3. MATCHES TABLE
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  player_x_id uuid not null,
  player_x_name text not null,
  player_o_id uuid not null,
  player_o_name text not null,
  starting_player text not null check (starting_player in ('X', 'O')),
  current_turn text not null check (current_turn in ('X', 'O')),
  status text not null default 'active' check (status in ('active', 'won', 'draw', 'abandoned')),
  winner_id uuid,
  winner_symbol text check (winner_symbol in ('X', 'O')),
  winning_line int[], -- array of 3 cell indices, e.g. [0, 1, 2]
  board_state text[] not null default array[null,null,null,null,null,null,null,null,null]::text[],
  x_marks int[] not null default array[]::int[], -- up to 3 cell indices
  o_marks int[] not null default array[]::int[], -- up to 3 cell indices
  draw_offered_by uuid,
  rematch_requested_by uuid,
  move_count int not null default 0,
  version int not null default 1,
  disconnected_player_id uuid,
  reconnect_deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_matches_room_id on public.matches (room_id);
create index if not exists idx_matches_status on public.matches (status);

-- 4. MATCH MOVES HISTORY
create table if not exists public.match_moves (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null,
  player_symbol text not null check (player_symbol in ('X', 'O')),
  cell_index int not null check (cell_index >= 0 and cell_index <= 8),
  removed_cell_index int check (removed_cell_index is null or (removed_cell_index >= 0 and removed_cell_index <= 8)),
  move_number int not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_match_moves_match_id on public.match_moves (match_id);

-- 5. MATCHMAKING QUEUE
create table if not exists public.matchmaking_queue (
  id uuid primary key default gen_random_uuid(),
  player_id uuid unique not null,
  player_name text not null,
  matched_match_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_matchmaking_queue_created_at on public.matchmaking_queue (created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.matches enable row level security;
alter table public.match_moves enable row level security;
alter table public.matchmaking_queue enable row level security;

-- Read policies
create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow upsert on profiles" on public.profiles for all using (true) with check (true);

create policy "Allow public read on rooms" on public.rooms for select using (true);
create policy "Allow insert/update on rooms via functions" on public.rooms for all using (true) with check (true);

create policy "Allow public read on matches" on public.matches for select using (true);
create policy "Allow updates on matches" on public.matches for all using (true) with check (true);

create policy "Allow public read on match_moves" on public.match_moves for select using (true);
create policy "Allow insert on match_moves" on public.match_moves for insert with check (true);

create policy "Allow all on matchmaking_queue" on public.matchmaking_queue for all using (true) with check (true);

-- Enable Realtime publication
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.matchmaking_queue;

-- ============================================================================
-- HELPER FUNCTIONS & AUTHORITATIVE GAME RPCs
-- ============================================================================

-- Generate 6-char alphanumeric room code
create or replace function public.generate_room_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- CREATE PRIVATE ROOM
create or replace function public.create_private_room(
  p_player_id uuid,
  p_player_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_code text;
  v_room_id uuid;
  v_attempts int := 0;
begin
  loop
    v_code := public.generate_room_code();
    begin
      insert into public.rooms (code, host_id, host_name, status)
      values (v_code, p_player_id, p_player_name, 'waiting')
      returning id into v_room_id;
      exit; -- Successfully inserted
    exception when unique_violation then
      v_attempts := v_attempts + 1;
      if v_attempts > 10 then
        raise exception 'Could not generate unique room code';
      end if;
    end;
  end loop;

  return json_build_object(
    'room_id', v_room_id,
    'room_code', v_code,
    'host_id', p_player_id,
    'host_name', p_player_name,
    'status', 'waiting'
  );
end;
$$;

-- JOIN PRIVATE ROOM
create or replace function public.join_private_room(
  p_room_code text,
  p_player_id uuid,
  p_player_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_room record;
  v_match_id uuid;
  v_starter text;
  v_player_x_id uuid;
  v_player_x_name text;
  v_player_o_id uuid;
  v_player_o_name text;
begin
  -- Find waiting room
  select * into v_room from public.rooms
  where code = upper(trim(p_room_code)) and status = 'waiting'
  for update;

  if not found then
    raise exception 'Room not found or game already started.';
  end if;

  if v_room.host_id = p_player_id then
    raise exception 'Host cannot join their own room as guest.';
  end if;

  -- Randomly assign X and O between host and guest
  if random() < 0.5 then
    v_player_x_id := v_room.host_id;
    v_player_x_name := v_room.host_name;
    v_player_o_id := p_player_id;
    v_player_o_name := p_player_name;
  else
    v_player_x_id := p_player_id;
    v_player_x_name := p_player_name;
    v_player_o_id := v_room.host_id;
    v_player_o_name := v_room.host_name;
  end if;

  -- Random starting player (X or O)
  v_starter := case when random() < 0.5 then 'X' else 'O' end;

  -- Update room status
  update public.rooms
  set guest_id = p_player_id,
      guest_name = p_player_name,
      status = 'playing'
  where id = v_room.id;

  -- Create authoritative match
  insert into public.matches (
    room_id,
    player_x_id, player_x_name,
    player_o_id, player_o_name,
    starting_player, current_turn,
    status, board_state, x_marks, o_marks,
    version, move_count
  )
  values (
    v_room.id,
    v_player_x_id, v_player_x_name,
    v_player_o_id, v_player_o_name,
    v_starter, v_starter,
    'active', array[null,null,null,null,null,null,null,null,null]::text[],
    array[]::int[], array[]::int[],
    1, 0
  )
  returning id into v_match_id;

  return json_build_object(
    'room_id', v_room.id,
    'room_code', v_room.code,
    'match_id', v_match_id,
    'player_x_id', v_player_x_id,
    'player_o_id', v_player_o_id,
    'starting_player', v_starter
  );
end;
$$;

-- SUBMIT ONLINE MOVE (AUTHORITATIVE SERVER-SIDE GAME ENGINE)
create or replace function public.submit_online_move(
  p_match_id uuid,
  p_player_id uuid,
  p_cell_index int,
  p_expected_version int
)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
  v_symbol text;
  v_board text[];
  v_marks int[];
  v_removed_cell int := null;
  v_winner_symbol text := null;
  v_winning_line int[] := null;
  v_next_turn text;
  v_next_status text := 'active';
  v_combos int[][] := array[
    array[0,1,2], array[3,4,5], array[6,7,8],
    array[0,3,6], array[1,4,7], array[2,5,8],
    array[0,4,8], array[2,4,6]
  ];
  v_c int[];
  v_idx int;
begin
  -- Lock match row for atomic execution
  select * into v_match from public.matches
  where id = p_match_id
  for update;

  if not found then
    raise exception 'Match not found';
  end if;

  if v_match.status != 'active' then
    raise exception 'Match is not active (status: %)', v_match.status;
  end if;

  if v_match.version != p_expected_version then
    raise exception 'Concurrency conflict: state has changed. Please refresh.';
  end if;

  -- Determine player symbol and verify turn
  if p_player_id = v_match.player_x_id then
    v_symbol := 'X';
  elsif p_player_id = v_match.player_o_id then
    v_symbol := 'O';
  else
    raise exception 'You are not a participant in this match.';
  end if;

  if v_match.current_turn != v_symbol then
    raise exception 'It is not your turn.';
  end if;

  if p_cell_index < 0 or p_cell_index > 8 then
    raise exception 'Invalid cell index %', p_cell_index;
  end if;

  v_board := v_match.board_state;

  -- Verify cell is empty (1-indexed in PostgreSQL arrays)
  if v_board[p_cell_index + 1] is not null then
    raise exception 'Cell % is already occupied.', p_cell_index;
  end if;

  -- Load marks for current player
  if v_symbol = 'X' then
    v_marks := coalesce(v_match.x_marks, array[]::int[]);
  else
    v_marks := coalesce(v_match.o_marks, array[]::int[]);
  end if;

  -- If player already has 3 marks, remove the oldest mark
  if coalesce(array_length(v_marks, 1), 0) >= 3 then
    v_removed_cell := v_marks[1]; -- Oldest mark
    v_board[v_removed_cell + 1] := null; -- Clear from board
    v_marks := v_marks[2:3]; -- Slice out the first mark
  end if;

  -- Place new mark
  v_board[p_cell_index + 1] := v_symbol;
  v_marks := array_append(v_marks, p_cell_index);

  -- Update marks in match record variables
  if v_symbol = 'X' then
    v_match.x_marks := v_marks;
  else
    v_match.o_marks := v_marks;
  end if;

  -- Evaluate winning combinations on the completed board
  for v_idx in 1..8 loop
    v_c := v_combos[v_idx];
    if v_board[v_c[1] + 1] is not null
       and v_board[v_c[1] + 1] = v_board[v_c[2] + 1]
       and v_board[v_c[1] + 1] = v_board[v_c[3] + 1] then
      v_winner_symbol := v_board[v_c[1] + 1];
      v_winning_line := v_c;
      exit;
    end if;
  end loop;

  if v_winner_symbol is not null then
    v_next_status := 'won';
    v_next_turn := v_match.current_turn;
  else
    v_next_status := 'active';
    v_next_turn := case when v_symbol = 'X' then 'O' else 'X' end;
  end if;

  -- Update authoritative match
  update public.matches
  set board_state = v_board,
      x_marks = case when v_symbol = 'X' then v_marks else v_match.x_marks end,
      o_marks = case when v_symbol = 'O' then v_marks else v_match.o_marks end,
      current_turn = v_next_turn,
      status = v_next_status,
      winner_id = case when v_winner_symbol is not null then p_player_id else null end,
      winner_symbol = v_winner_symbol,
      winning_line = v_winning_line,
      draw_offered_by = null,
      move_count = v_match.move_count + 1,
      version = v_match.version + 1,
      updated_at = now()
  where id = p_match_id;

  -- Record move in match_moves history
  insert into public.match_moves (
    match_id, player_id, player_symbol, cell_index, removed_cell_index, move_number
  )
  values (
    p_match_id, p_player_id, v_symbol, p_cell_index, v_removed_cell, v_match.move_count + 1
  );

  return json_build_object(
    'success', true,
    'match_id', p_match_id,
    'version', v_match.version + 1,
    'removed_cell_index', v_removed_cell,
    'winner_symbol', v_winner_symbol,
    'status', v_next_status
  );
end;
$$;

-- DRAW OFFER RPC
create or replace function public.offer_draw_rpc(
  p_match_id uuid,
  p_player_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
begin
  select * into v_match from public.matches where id = p_match_id for update;

  if not found or v_match.status != 'active' then
    raise exception 'Match is not active';
  end if;

  if p_player_id != v_match.player_x_id and p_player_id != v_match.player_o_id then
    raise exception 'Unauthorized';
  end if;

  -- If opponent already offered draw, accept it
  if v_match.draw_offered_by is not null and v_match.draw_offered_by != p_player_id then
    update public.matches
    set status = 'draw', draw_offered_by = null, version = version + 1, updated_at = now()
    where id = p_match_id;
    return json_build_object('success', true, 'status', 'draw');
  end if;

  update public.matches
  set draw_offered_by = p_player_id, version = version + 1, updated_at = now()
  where id = p_match_id;

  return json_build_object('success', true, 'status', 'offered');
end;
$$;

-- RESPOND DRAW RPC
create or replace function public.respond_draw_rpc(
  p_match_id uuid,
  p_player_id uuid,
  p_accept boolean
)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
begin
  select * into v_match from public.matches where id = p_match_id for update;

  if not found or v_match.status != 'active' then
    raise exception 'Match is not active';
  end if;

  if v_match.draw_offered_by is null or v_match.draw_offered_by = p_player_id then
    raise exception 'No valid draw offer to respond to';
  end if;

  if p_accept then
    update public.matches
    set status = 'draw', draw_offered_by = null, version = version + 1, updated_at = now()
    where id = p_match_id;
  else
    update public.matches
    set draw_offered_by = null, version = version + 1, updated_at = now()
    where id = p_match_id;
  end if;

  return json_build_object('success', true, 'accepted', p_accept);
end;
$$;

-- 30-SECOND RECONNECTION POLICY RPCs

-- Record player disconnect
create or replace function public.record_disconnect_rpc(
  p_match_id uuid,
  p_player_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
  v_deadline timestamptz;
begin
  select * into v_match from public.matches where id = p_match_id for update;

  if not found or v_match.status != 'active' then
    return json_build_object('success', false);
  end if;

  v_deadline := now() + interval '30 seconds';

  update public.matches
  set disconnected_player_id = p_player_id,
      reconnect_deadline = v_deadline,
      version = version + 1,
      updated_at = now()
  where id = p_match_id;

  return json_build_object(
    'success', true,
    'disconnected_player_id', p_player_id,
    'reconnect_deadline', v_deadline
  );
end;
$$;

-- Record player reconnect
create or replace function public.record_reconnect_rpc(
  p_match_id uuid,
  p_player_id uuid
)
returns json
language plpgsql
security definer
as $$
begin
  update public.matches
  set disconnected_player_id = null,
      reconnect_deadline = null,
      version = version + 1,
      updated_at = now()
  where id = p_match_id
    and status = 'active'
    and disconnected_player_id = p_player_id;

  return json_build_object('success', true);
end;
$$;

-- Claim forfeit win when deadline expired
create or replace function public.claim_forfeit_rpc(
  p_match_id uuid,
  p_player_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_match record;
  v_winner_symbol text;
begin
  select * into v_match from public.matches where id = p_match_id for update;

  if not found or v_match.status != 'active' then
    raise exception 'Match is not active';
  end if;

  if v_match.disconnected_player_id is null or v_match.disconnected_player_id = p_player_id then
    raise exception 'No opponent disconnect to forfeit';
  end if;

  if now() < v_match.reconnect_deadline then
    raise exception 'Reconnection deadline has not yet expired';
  end if;

  v_winner_symbol := case when p_player_id = v_match.player_x_id then 'X' else 'O' end;

  update public.matches
  set status = 'won',
      winner_id = p_player_id,
      winner_symbol = v_winner_symbol,
      version = version + 1,
      updated_at = now()
  where id = p_match_id;

  return json_build_object(
    'success', true,
    'winner_id', p_player_id,
    'winner_symbol', v_winner_symbol,
    'reason', 'forfeit_timeout'
  );
end;
$$;

-- MATCHMAKING QUEUE RPCs
create or replace function public.join_matchmaking_rpc(
  p_player_id uuid,
  p_player_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_opponent record;
  v_room_id uuid;
  v_match_id uuid;
  v_code text;
  v_starter text;
begin
  -- Check if opponent is already in queue (older than current request)
  select * into v_opponent from public.matchmaking_queue
  where player_id != p_player_id
  order by created_at asc
  limit 1
  for update skip locked;

  if found then
    -- Remove opponent from queue
    delete from public.matchmaking_queue where id = v_opponent.id;
    delete from public.matchmaking_queue where player_id = p_player_id;

    -- Create room
    v_code := public.generate_room_code();
    insert into public.rooms (code, host_id, host_name, guest_id, guest_name, status)
    values (v_code, v_opponent.player_id, v_opponent.player_name, p_player_id, p_player_name, 'playing')
    returning id into v_room_id;

    -- Pick random starter
    v_starter := case when random() < 0.5 then 'X' else 'O' end;

    -- Create match
    insert into public.matches (
      room_id,
      player_x_id, player_x_name,
      player_o_id, player_o_name,
      starting_player, current_turn,
      status, board_state, x_marks, o_marks,
      version, move_count
    )
    values (
      v_room_id,
      v_opponent.player_id, v_opponent.player_name,
      p_player_id, p_player_name,
      v_starter, v_starter,
      'active', array[null,null,null,null,null,null,null,null,null]::text[],
      array[]::int[], array[]::int[],
      1, 0
    )
    returning id into v_match_id;

    return json_build_object(
      'matched', true,
      'room_id', v_room_id,
      'room_code', v_code,
      'match_id', v_match_id
    );
  else
    -- Add self to queue
    insert into public.matchmaking_queue (player_id, player_name)
    values (p_player_id, p_player_name)
    on conflict (player_id) do update
    set player_name = excluded.player_name, created_at = now();

    return json_build_object(
      'matched', false,
      'queued', true
    );
  end if;
end;
$$;

create or replace function public.leave_matchmaking_rpc(
  p_player_id uuid
)
returns json
language plpgsql
security definer
as $$
begin
  delete from public.matchmaking_queue where player_id = p_player_id;
  return json_build_object('success', true);
end;
$$;
