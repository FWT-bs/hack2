/**
 * Domain classification from room_rules + user_rules.
 * Order: personal_blocked > room blocked > personal_allowed > room allowed > unlisted.
 */

export function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase().trim()
}

export type DomainLists = { allowed: string[]; blocked: string[] }

export function mergeRules(
  roomRules: { allowed_domains?: string[]; blocked_domains?: string[] } | null,
  userRules: { personal_allowed_domains?: string[]; personal_blocked_domains?: string[] } | null
): DomainLists {
  const normalize = (d: string) => normalizeDomain(d)
  const toSet = (arr: string[] | undefined) => new Set((arr ?? []).map(normalize).filter(Boolean))

  const personalBlocked = toSet(userRules?.personal_blocked_domains ?? [])
  const personalAllowed = toSet(userRules?.personal_allowed_domains ?? [])
  const roomBlocked = toSet(roomRules?.blocked_domains ?? [])
  const roomAllowed = toSet(roomRules?.allowed_domains ?? [])

  const blocked = [...personalBlocked]
  roomBlocked.forEach((d) => {
    if (!blocked.includes(d)) blocked.push(d)
  })

  const allowed = [...personalAllowed]
  roomAllowed.forEach((d) => {
    if (!allowed.includes(d)) allowed.push(d)
  })

  return { allowed, blocked }
}

export function classifyFromLists(
  domain: string,
  lists: DomainLists
): "allowed" | "blocked" | "unlisted" {
  const d = normalizeDomain(domain)
  const { allowed, blocked } = lists
  const norm = (x: string) => normalizeDomain(x)
  if (blocked.some((b) => d === norm(b) || d.endsWith("." + norm(b)))) return "blocked"
  if (allowed.some((a) => d === norm(a) || d.endsWith("." + norm(a)))) return "allowed"
  return "unlisted"
}
