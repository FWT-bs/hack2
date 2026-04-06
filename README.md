# LockIn

**Focus rooms with real accountability.** Start a study session, set goals, and keep each other on track — with gentle nudges, shared blocklists, and an optional Chrome extension that notices when you wander.

Built with Next.js 16 (App Router), React 19, Supabase (Auth + Postgres + Realtime), and Tailwind CSS.

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

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the Supabase migrations in `supabase/migrations/` against your project, then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Chrome Extension (optional)

1. Open `chrome://extensions` → enable **Developer mode**
2. Click **Load unpacked** → select the `extension/` folder
3. The extension reports your active tab domain to the app every 5 seconds during focus sessions

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
- `friends` — Bidirectional friend relationships with status

All mutations go through RLS policies or the `create_room` RPC function.

## License

MIT
