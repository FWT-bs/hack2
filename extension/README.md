# LockIn Browser Extension

The extension helps during focus sessions by reporting your current tab to the app and showing a gentle overlay when you visit blocked sites. It only runs when you're in a session; it does not monitor 24/7.

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

## API payloads

- **POST /api/activity**: body may include `domain`, `url`, `user_id`, `room_id`. When `user_id` and `room_id` are present and the request is authorized (e.g. via device token), the server uses `room_rules` and `user_rules` from the database to classify the domain.
- **GET /api/activity/domains**: optional query `room_id=`. When the request is authenticated (cookie or device token), returns merged allowed/blocked lists for that room and the current user.
