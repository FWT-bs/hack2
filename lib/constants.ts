export const GRACE_PERIOD_SECONDS = 30
export const WARNING_THRESHOLD_SECONDS = 30
export const LOCK_THRESHOLD_SECONDS = 90

export const MIN_ROOM_CAPACITY = 2
export const MAX_ROOM_CAPACITY = 6
export const DEFAULT_ROOM_CAPACITY = 6

export const SESSION_DURATIONS = [15, 25, 45, 60, 90, 120] as const

export const GRADE_BANDS = [
  { value: 'middle_school', label: 'Middle School' },
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'other', label: 'Other' },
] as const

export const REVIEW_TIMEOUT_SECONDS = 60
export const EXTENSION_POLL_INTERVAL_SECONDS = 5
