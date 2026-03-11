-- Let any authenticated user see rooms with visibility 'link' (so they show in "All rooms").
create policy "Users can view link-visible rooms" on public.rooms
  for select using (visibility = 'link');

-- Default new rooms to 'link' so they appear in All rooms for others.
create or replace function public.create_room(p_name text, p_topic text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_room_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.rooms (host_id, name, topic, visibility)
  values (v_user_id, coalesce(nullif(trim(p_name), ''), 'Study room'), nullif(trim(p_topic), ''), 'link')
  returning id into v_room_id;

  insert into public.room_members (room_id, user_id, role)
  values (v_room_id, v_user_id, 'host');

  insert into public.room_rules (room_id, allowed_domains, blocked_domains, strictness)
  values (
    v_room_id,
    array['docs.google.com', 'stackoverflow.com', 'github.com', 'developer.mozilla.org', 'localhost'],
    array['youtube.com', 'reddit.com', 'twitter.com', 'tiktok.com', 'instagram.com', 'x.com'],
    'standard'
  );

  return v_room_id;
end;
$$;

-- Keep rooms.updated_at in sync when members join or leave
create or replace function public.room_members_updated_at()
returns trigger as $$
begin
  update public.rooms set updated_at = now() where id = coalesce(new.room_id, old.room_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists room_members_updated_at on public.room_members;
create trigger room_members_updated_at
  after insert or update or delete on public.room_members
  for each row execute function public.room_members_updated_at();
