// In-memory store for demo: focus state set by POST /api/activity (extension), read by GET /api/activity/state (room page).

let focusState = "on-task"

export function getFocusState() {
  return focusState
}

export function setFocusState(s: string) {
  focusState = s
}
