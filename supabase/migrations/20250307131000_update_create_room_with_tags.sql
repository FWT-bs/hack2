-- Extend create_room RPC to accept tags and planned duration

create or replace function public.create_room(
  p_name text,
  p_topic text default null,
  p_tags text[] default '{}',
  p_duration_minutes int default 50
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_room_id uuid;
  v_duration int;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  v_duration := coalesce(nullif(p_duration_minutes, 0), 50);

  insert into public.rooms (host_id, name, topic, visibility, tags, planned_duration_minutes, ends_at)
  values (
    v_user_id,
    coalesce(nullif(trim(p_name), ''), 'Study room'),
    nullif(trim(p_topic), ''),
    'link',
    coalesce(p_tags, '{}'),
    v_duration,
    now() + make_interval(mins => v_duration)
  )
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

grant execute on function public.create_room(text, text, text[], int) to authenticated;
grant execute on function public.create_room(text, text, text[], int) to service_role;

