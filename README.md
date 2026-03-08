# LockIn — Demo

Front-end demo: **group chat** and **blocked-domain focus state** (warning banner + lock overlay). No database or auth.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 → **Open demo room**.

- **Chat:** Type and send; messages stay in memory (reset on refresh).
- **Focus state:** Use the **Simulate** buttons (On task / Warning / Locked / Break) to see the warning banner and lock overlay.
- **Lock overlay:** Click "Request accountability review" to open the break-request dialog (submit is demo-only).

## Extension (optional)

Load the `extension/` folder in Chrome (Developer mode → Load unpacked). It reports your current tab’s domain to `POST /api/activity` every 5s. The demo room page polls `GET /api/activity/state` and updates the focus badge (and lock overlay when domain is blocked).

Allowed (on-task): e.g. docs.google.com, stackoverflow.com, localhost.  
Blocked (locked): e.g. youtube.com, reddit.com, twitter.com.

## License

MIT
