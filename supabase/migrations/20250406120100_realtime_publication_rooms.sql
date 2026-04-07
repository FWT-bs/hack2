-- Enable postgres_changes for room membership and room metadata (headers, timers).
-- If a line errors with "already member of publication", remove that line and re-run, or enable in Dashboard → Database → Publications.

alter publication supabase_realtime add table public.room_members;
alter publication supabase_realtime add table public.rooms;
