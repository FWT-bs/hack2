-- Compatibility wrapper for create_room RPC
-- Some clients/schema caches expect params ordered as:
--   (p_duration_minutes, p_name, p_tags, p_topic)

create or replace function public.create_room(
  p_duration_minutes int,
  p_name text,
  p_tags text[] default '{}',
  p_topic text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.create_room(
    p_name => p_name,
    p_topic => p_topic,
    p_tags => coalesce(p_tags, '{}'),
    p_duration_minutes => coalesce(p_duration_minutes, 50)
  );
end;
$$;

grant execute on function public.create_room(int, text, text[], text) to authenticated;
grant execute on function public.create_room(int, text, text[], text) to service_role;

