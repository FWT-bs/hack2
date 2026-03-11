-- LockIn initial schema: profiles, friends, rooms, room_members, messages,
-- focus_sessions, focus_events, room_rules, user_rules, extension_devices + RLS

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  school text,
  bio text,
  created_at timestamptz not null default now()
);

-- Friends (mutual relationships)
create table public.friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique(user_id, friend_id),
  check (user_id != friend_id)
);

-- Rooms
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  topic text,
  visibility text not null default 'friends' check (visibility in ('private', 'friends', 'link')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Room members
create table public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('host', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (room_id, user_id)
);

-- Focus sessions (per user per room)
create table public.focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  goal text,
  planned_duration_minutes int,
  actual_focus_minutes int default 0,
  off_task_events int default 0
);

-- Messages (room chat)
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  type text not null default 'message' check (type in ('message', 'system', 'reaction')),
  created_at timestamptz not null default now()
);

-- Focus events (extension + app events)
create table public.focus_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  session_id uuid references public.focus_sessions(id) on delete set null,
  event_type text not null,
  domain text,
  url text,
  created_at timestamptz not null default now()
);

-- Room rules (allowed/blocked domains per room)
create table public.room_rules (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade unique,
  allowed_domains text[] default '{}',
  blocked_domains text[] default '{}',
  strictness text not null default 'standard' check (strictness in ('chill', 'standard', 'hardcore')),
  grace_seconds_before_warning int default 30,
  max_warnings_before_lock int default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User rules (personal allow/block overrides)
create table public.user_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  personal_allowed_domains text[] default '{}',
  personal_blocked_domains text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extension devices (linked browsers)
create table public.extension_devices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device_label text,
  browser_type text default 'chrome',
  last_seen_at timestamptz,
  token_id text,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_friends_user_id on public.friends(user_id);
create index idx_friends_friend_id on public.friends(friend_id);
create index idx_room_members_user_id on public.room_members(user_id);
create index idx_room_members_room_id on public.room_members(room_id);
create index idx_focus_sessions_room_user on public.focus_sessions(room_id, user_id);
create index idx_messages_room_id on public.messages(room_id);
create index idx_focus_events_session_id on public.focus_events(session_id);
create index idx_extension_devices_user_id on public.extension_devices(user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: enable on all tables
alter table public.profiles enable row level security;
alter table public.friends enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.focus_events enable row level security;
alter table public.room_rules enable row level security;
alter table public.user_rules enable row level security;
alter table public.extension_devices enable row level security;

-- Profiles: own row only
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view other profiles" on public.profiles for select using (true);

-- Friends: only rows where user is participant
create policy "Users can view own friends" on public.friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can insert friend rows" on public.friends for insert with check (auth.uid() = user_id);
create policy "Users can update own friend rows" on public.friends for update using (auth.uid() = user_id or auth.uid() = friend_id);

-- Rooms: members + friends of host for visibility 'friends'
create policy "Users can view rooms they are in" on public.rooms for select using (
  exists (select 1 from public.room_members rm where rm.room_id = rooms.id and rm.user_id = auth.uid())
  or (visibility = 'friends' and exists (select 1 from public.friends f where f.user_id = auth.uid() and f.friend_id = rooms.host_id and f.status = 'accepted'))
  or (visibility = 'friends' and exists (select 1 from public.friends f where f.friend_id = auth.uid() and f.user_id = rooms.host_id and f.status = 'accepted'))
);
create policy "Users can create rooms" on public.rooms for insert with check (auth.uid() = host_id);
create policy "Hosts can update own rooms" on public.rooms for update using (auth.uid() = host_id);

-- Room members: only for rooms user can see
create policy "Users can view room members of accessible rooms" on public.room_members for select using (
  exists (select 1 from public.rooms r where r.id = room_members.room_id and (
    exists (select 1 from public.room_members rm where rm.room_id = r.id and rm.user_id = auth.uid())
    or (r.visibility = 'friends' and (exists (select 1 from public.friends f where (f.user_id = auth.uid() and f.friend_id = r.host_id) or (f.friend_id = auth.uid() and f.user_id = r.host_id) and f.status = 'accepted')))
  ))
);
create policy "Users can join rooms" on public.room_members for insert with check (auth.uid() = user_id);
create policy "Users can update own membership" on public.room_members for update using (auth.uid() = user_id);

-- Focus sessions: same room visibility
create policy "Users can view focus sessions in accessible rooms" on public.focus_sessions for select using (
  exists (select 1 from public.room_members rm where rm.room_id = focus_sessions.room_id and rm.user_id = auth.uid())
);
create policy "Users can insert own focus sessions" on public.focus_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own focus sessions" on public.focus_sessions for update using (auth.uid() = user_id);

-- Messages: room members only
create policy "Users can view messages in joined rooms" on public.messages for select using (
  exists (select 1 from public.room_members rm where rm.room_id = messages.room_id and rm.user_id = auth.uid())
);
create policy "Users can send messages in joined rooms" on public.messages for insert with check (
  auth.uid() = user_id and exists (select 1 from public.room_members rm where rm.room_id = messages.room_id and rm.user_id = auth.uid())
);

-- Focus events: own events only
create policy "Users can view own focus events" on public.focus_events for select using (auth.uid() = user_id);
create policy "Users can insert own focus events" on public.focus_events for insert with check (auth.uid() = user_id);

-- Room rules: room members
create policy "Users can view room rules for joined rooms" on public.room_rules for select using (
  exists (select 1 from public.room_members rm where rm.room_id = room_rules.room_id and rm.user_id = auth.uid())
);
create policy "Hosts can manage room rules" on public.room_rules for all using (
  exists (select 1 from public.rooms r where r.id = room_rules.room_id and r.host_id = auth.uid())
);

-- User rules: own only
create policy "Users can manage own user rules" on public.user_rules for all using (auth.uid() = user_id);

-- Extension devices: own only
create policy "Users can manage own extension devices" on public.extension_devices for all using (auth.uid() = user_id);
