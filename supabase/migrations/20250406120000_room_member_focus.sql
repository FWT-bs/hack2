-- Per-member focus snapshot for live room UI (updated by POST /api/activity when user is in a room).

create table public.room_member_focus (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  focus_state text not null default 'on-task'
    check (focus_state in ('on-task', 'warning', 'locked', 'approved-break')),
  tab_domain text,
  updated_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index idx_room_member_focus_room on public.room_member_focus(room_id);

alter table public.room_member_focus enable row level security;

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

alter publication supabase_realtime add table public.room_member_focus;
