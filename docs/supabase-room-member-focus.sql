-- Run in Supabase SQL Editor if you apply schema manually (instead of CLI migrations).
-- Order: run after initial LockIn schema / room migrations exist.

-- -----------------------------------------------------------------------------
-- Table: room_member_focus
-- -----------------------------------------------------------------------------
create table if not exists public.room_member_focus (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  focus_state text not null default 'on-task'
    check (focus_state in ('on-task', 'warning', 'locked', 'approved-break')),
  tab_domain text,
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists idx_room_member_focus_room on public.room_member_focus(room_id);

alter table public.room_member_focus enable row level security;

drop policy if exists "Room members can view focus rows in their rooms" on public.room_member_focus;
create policy "Room members can view focus rows in their rooms"
  on public.room_member_focus for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_member_focus.room_id
        and rm.user_id = auth.uid()
        and rm.left_at is null
    )
  );

drop policy if exists "Members can insert own focus row" on public.room_member_focus;
create policy "Members can insert own focus row"
  on public.room_member_focus for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_members rm
      where rm.room_id = room_member_focus.room_id
        and rm.user_id = auth.uid()
        and rm.left_at is null
    )
  );

drop policy if exists "Members can update own focus row" on public.room_member_focus;
create policy "Members can update own focus row"
  on public.room_member_focus for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_members rm
      where rm.room_id = room_member_focus.room_id
        and rm.user_id = auth.uid()
        and rm.left_at is null
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_members rm
      where rm.room_id = room_member_focus.room_id
        and rm.user_id = auth.uid()
        and rm.left_at is null
    )
  );

-- -----------------------------------------------------------------------------
-- Realtime: expose table to supabase_realtime publication
-- If this errors with "already member of publication", skip.
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.room_member_focus;

-- Live membership + room header (optional if not already enabled in Dashboard → Replication):
-- alter publication supabase_realtime add table public.room_members;
-- alter publication supabase_realtime add table public.rooms;
