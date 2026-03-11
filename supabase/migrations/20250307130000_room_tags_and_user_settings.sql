-- Room tags and user-level settings for preferences and discovery

-- Add tags and optional metadata to rooms
alter table public.rooms
  add column if not exists tags text[] default '{}',
  add column if not exists planned_duration_minutes int,
  add column if not exists ends_at timestamptz;

create index if not exists idx_rooms_tags on public.rooms using gin (tags);
create index if not exists idx_rooms_ends_at on public.rooms(ends_at);

-- User-level general settings (notifications, privacy, appearance)
create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  -- Notifications
  email_room_invites boolean default true,
  email_focus_recaps boolean default true,
  push_break_reminders boolean default true,
  -- Privacy
  show_real_name boolean default true,
  share_current_room_with_friends boolean default true,
  share_focus_history_with_room boolean default false,
  -- Appearance
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  density text not null default 'comfortable' check (density in ('comfortable', 'compact')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy if not exists "Users can manage own user settings" on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_settings_user_id on public.user_settings(user_id);

-- User-level focus/accountability preferences
create table if not exists public.user_focus_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  default_strictness text not null default 'standard' check (default_strictness in ('chill', 'standard', 'hardcore')),
  grace_seconds_before_warning int default 30,
  max_warnings_before_lock int default 3,
  allow_break_requests boolean default true,
  auto_share_off_task_events boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_focus_settings enable row level security;

create policy if not exists "Users can manage own user focus settings" on public.user_focus_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_user_focus_settings_user_id on public.user_focus_settings(user_id);

