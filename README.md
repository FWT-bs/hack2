# LockIn

**Focus rooms with real accountability.** Start a study session, set goals, and keep each other on track — with gentle nudges, shared blocklists, and an optional Chrome extension that notices when you wander.

Built with Next.js 16 (App Router), React 19, Supabase (Auth + Postgres + Realtime), and Tailwind CSS.

## Overview

LockIn is built around one idea: accountability works better when it's social and real-time. Users join a shared room, set a focus state, and the Chrome extension monitors active tab domains so the room can tell whether people are on task. If someone drifts, a warning appears; if they stay off-task, a lock overlay can prompt a group accountability review.

## Features

- **Real-time study rooms** — Create or join rooms with live chat powered by Supabase Realtime. Set session goals, durations, and topic tags so others can find your room.
- **Google OAuth + email auth** — One-click sign-in with Google, or email/password. Session tokens refresh automatically via middleware.
- **Focus monitoring** — The companion Chrome extension reports your active tab domain during sessions. Rooms classify tabs against shared allowed/blocked lists and surface focus state to all members.
- **Gentle lock overlay** — When you drift to a blocked site, a soft overlay nudges you back. No harsh alarms — just friendly accountability.
- **Break requests** — Need a break? Request one and let the group decide. Keeps everyone honest without being controlling.
- **Room discovery** — Browse, search, filter by tags, and sort rooms by activity, member count, or time remaining.
- **Dashboard** — See your rooms, friends currently studying, and suggested sessions at a glance.
- **Dark mode** — Full light/dark theme support with system preference detection.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| UI | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) components |
| Auth & Database | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime, RLS) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation |
| Extension | Chrome Manifest V3 (background service worker + content scripts) |
| Hosting | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project (free tier works)

### Setup

```bash
git clone https://github.com/FWT-bs/hack2.git
cd hack2
npm install
```

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional (recommended on Vercel): set **`NEXT_PUBLIC_APP_URL`** to your canonical site URL (e.g. `https://your-project.vercel.app`) for consistent client-side links. Add the same URL under **Supabase → Authentication → URL configuration** (redirect / site URL) when you deploy.

### Supabase CLI

This repo includes [`supabase/config.toml`](supabase/config.toml) and [`supabase/.gitignore`](supabase/.gitignore) for local tooling, similar in layout to other projects — **do not paste SQL from unrelated apps** into this project’s database.

- Link and push migrations: `supabase link` then `supabase db push` (or run files in `supabase/migrations/` manually).
- If you prefer the dashboard: you can paste the companion script for focus snapshots from [`docs/supabase-room-member-focus.sql`](docs/supabase-room-member-focus.sql) (in addition to the migrations folder).

Run the Supabase migrations in `supabase/migrations/` against your project (via the [Supabase CLI](https://supabase.com/docs/guides/cli) or the dashboard SQL editor), then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Chrome Extension (optional)

1. Open `chrome://extensions` → enable **Developer mode**
2. Click **Load unpacked** → select the `extension/` folder
3. **Local dev:** open [http://localhost:3000](http://localhost:3000) once so the extension stores `app_origin`.
4. **Vercel:** after deploy, open your production URL once (while logged in). The extension uses that origin for `/api/activity` and domain lists. See [`extension/README.md`](extension/README.md) for custom domains and permissions.
5. The background worker polls the active tab on a **short interval** (target ~15s; the browser may throttle alarms slightly).

### Deploying to Vercel

- Create a Vercel project from this repo and set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `NEXT_PUBLIC_APP_URL`).
- In Supabase Auth settings, add your Vercel domain to redirect allow lists.
- Run all SQL migrations against your hosted Supabase project before relying on live **member focus** (`room_member_focus`) or **Realtime** on `room_members` / `rooms`.

## Project Structure

```
app/
├── page.tsx                  # Landing page
├── login/ & signup/          # Auth pages
├── (app)/                    # Authenticated shell (shared nav)
│   ├── home/                 # Dashboard — featured room, friends, suggestions
│   ├── rooms/                # Room list, search, create
│   │   ├── new/              # Create room form
│   │   └── [id]/             # Live room — chat, members, focus state
│   ├── friends/              # Friend list
│   ├── history/              # Session history
│   └── settings/             # Profile & preferences
├── api/
│   ├── activity/             # Extension → app focus reporting
│   ├── focus-events/         # Focus session event logging
│   └── settings/             # Profile & preference endpoints
components/
├── room/                     # Room UI — chat, members, header, focus badges
├── ui/                       # shadcn/ui primitives
└── app-nav.tsx               # Main navigation (desktop + mobile)
hooks/                        # useRooms, useRoom (Realtime), useSessionTimer
lib/
├── supabase/                 # Client, server, and middleware helpers
└── validators.ts             # Shared Zod schemas
extension/                    # Chrome extension source
supabase/migrations/          # PostgreSQL schema + RLS policies
```

## Database

The schema uses PostgreSQL with Row Level Security. Key tables:

- `profiles` — User display name, avatar, preferences
- `rooms` — Name, topic, tags, duration, timestamps
- `room_members` — Join/leave tracking with roles
- `messages` — Real-time chat per room
- `room_rules` / `user_rules` — Allowed/blocked domain lists
- `room_member_focus` — Latest focus classification per member per room (updated from `/api/activity`; subscribed over Realtime in the room UI)
- `friends` — Bidirectional friend relationships with status

All mutations go through RLS policies or the `create_room` RPC function.

## License

MIT
