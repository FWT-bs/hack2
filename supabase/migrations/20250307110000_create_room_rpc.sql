-- RPC to create a room so the insert runs with auth.uid() from the request JWT (avoids RLS/session issues).

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

-- Allow authenticated users to call it
grant execute on function public.create_room(text, text) to authenticated;
grant execute on function public.create_room(text, text) to service_role;
