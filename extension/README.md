# LockIn Browser Extension

The extension helps during focus sessions by reporting your current tab to the app and showing a gentle overlay when you visit blocked sites. It only runs when you're in a session; it does not monitor 24/7.

## Production URL (Vercel)

API calls use a stored **`app_origin`** (e.g. `https://your-app.vercel.app`). It is set automatically when you **open the deployed site** with the extension installed: the in-app content script sends `window.location.origin` to the background worker.

- Stay **logged in** on that origin so `credentials: "include"` sends your session cookies to `/api/activity` and `/api/focus-events`.
- Default fallback is `http://localhost:3000` until you’ve opened the app once on production.
- **Custom domain**: add your origin to `manifest.json` under `content_scripts` (app entry), `externally_connectable`, and `host_permissions`. For broad HTTPS access, Chrome may prompt you to allow **optional host permissions** after install (`https://*/*` is listed as optional).

Optional env in the Next app (documentation only; not read by the extension): `NEXT_PUBLIC_APP_URL` — set on Vercel to your canonical site URL for links and auth redirects in the web app.

## Polling

The service worker schedules **short-interval chained alarms** (target ~15 seconds) to POST the active tab domain. Browsers may clamp alarm timing; if updates feel slow, open the app popup — it also refreshes when storage changes after each successful poll.

## Linking your browser (device link flow)

To use room-level and personal rules from the app (instead of demo defaults), link this browser to your account:

1. **In the LockIn web app**: Go to **Settings → Extension**.
2. Click **"Link this browser"**. The app will show a short-lived **link code** (e.g. 6 characters).
3. **In the extension**: Open the extension popup and enter the code.
4. The extension will call an API to exchange the code for a device token, then store `user_id` (and optionally `room_id` when you're in a room) in local storage.
5. All future requests to `/api/activity` and `/api/activity/domains` will include this context so the app can apply your real room and user rules.

Until linking is implemented end-to-end, the extension works in demo mode: it sends the current tab domain to the app, and the app uses in-memory default rules when no session cookie is present.

## Storing context from the app

The app can set the extension's context by sending a message to the extension (e.g. when the user joins a room):

- `SET_LINK_CONTEXT`: pass `{ user_id, room_id? }` so the extension includes them in API calls. This requires the extension to be able to receive messages from the app (e.g. via a content script on the app origin).
- `SET_APP_ORIGIN` / `GET_APP_ORIGIN`: used internally so overlay + fetches share the same base URL as the web app.

## API payloads

- **POST /api/activity**: body may include `domain`, `url`, `user_id`, `room_id`. When the request is authenticated (session cookie), the server uses `room_rules` and `user_rules` from the database to classify the domain and upserts **`room_member_focus`** for live member state in the room UI.
- **GET /api/activity/domains**: optional query `room_id=`. When the request is authenticated (cookie or device token), returns merged allowed/blocked lists for that room and the current user.
