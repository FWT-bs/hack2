# LockIn

A real-time accountability platform that keeps you and your group on task — with a Chrome extension, live focus tracking, and a lock overlay that kicks in when you drift.

## Overview

LockIn is built around one idea: accountability works better when it's social and real-time. Users join a shared room, set a focus state, and a Chrome extension monitors active tab domains to report whether they're actually on task. If someone drifts, a warning banner appears. If they stay off-task, a lock overlay triggers and prompts them to request a group accountability review.

## Features

- **Group chat** — Session-persistent messaging visible to all room members
- **Live focus states** — On Task / Warning / Locked / Break, driven by Chrome extension activity
- **Lock overlay** — Covers the screen and surfaces a "Request accountability review" dialog when triggered
- **Chrome extension** — Monitors the active tab's domain and pushes real-time status updates to the room
- **Supabase Realtime** — State synced live across all connected clients with no polling

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (PostgreSQL + Realtime) |
| Browser Extension | Chrome Extension Manifest V3 |
| Hosting | Vercel |

## Getting Started

```bash
git clone https://github.com/FWT-bs/hack2
cd hack2
npm install
```

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access a demo room.

### Chrome Extension

1. Go to `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `extension/` folder
3. The extension will begin monitoring active tab domains and reporting status to your room

## Database

Schema is managed via Supabase migrations in `supabase/migrations/`. Apply them through the Supabase CLI or the dashboard SQL editor.

## License

MIT

