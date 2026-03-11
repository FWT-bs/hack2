-- Fix infinite recursion: room_members policy was querying room_members again.
-- Use a SECURITY DEFINER function so the membership check bypasses RLS.

create or replace function public.user_can_access_room(p_room_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = auth.uid()
  );
$$;

-- Drop the recursive policy and replace with one that uses the helper
drop policy if exists "Users can view room members of accessible rooms" on public.room_members;

create policy "Users can view room members of accessible rooms" on public.room_members
  for select
  using (auth.uid() = user_id or user_can_access_room(room_id));
