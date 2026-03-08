// In-memory allowed/blocked domain lists for demo. API and extension use these.

const DEFAULT_ALLOWED = [
  "docs.google.com",
  "stackoverflow.com",
  "github.com",
  "developer.mozilla.org",
  "localhost",
]
const DEFAULT_BLOCKED = ["youtube.com", "reddit.com", "twitter.com", "tiktok.com", "instagram.com", "x.com"]

let allowed: string[] = [...DEFAULT_ALLOWED]
let blocked: string[] = [...DEFAULT_BLOCKED]

function normalize(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase().trim()
}

export function getDomainLists(): { allowed: string[]; blocked: string[] } {
  return { allowed: [...allowed], blocked: [...blocked] }
}

export function addAllowed(domain: string): void {
  const d = normalize(domain)
  if (!d) return
  if (!allowed.some((a) => normalize(a) === d)) allowed.push(d)
}

export function removeAllowed(domain: string): void {
  const d = normalize(domain)
  allowed = allowed.filter((a) => normalize(a) !== d)
}

export function addBlocked(domain: string): void {
  const d = normalize(domain)
  if (!d) return
  if (!blocked.some((b) => normalize(b) === d)) blocked.push(d)
}

export function removeBlocked(domain: string): void {
  const d = normalize(domain)
  blocked = blocked.filter((b) => normalize(b) !== d)
}

export function setDomainLists(list: { allowed?: string[]; blocked?: string[] }): void {
  if (Array.isArray(list.allowed)) {
    allowed = list.allowed.map(normalize).filter(Boolean)
    allowed = [...new Set(allowed)]
  }
  if (Array.isArray(list.blocked)) {
    blocked = list.blocked.map(normalize).filter(Boolean)
    blocked = [...new Set(blocked)]
  }
}

export function classifyDomain(domain: string): "allowed" | "blocked" | "unlisted" {
  const d = normalize(domain)
  if (blocked.some((b) => d === normalize(b) || d.endsWith("." + normalize(b)))) return "blocked"
  if (allowed.some((a) => d === normalize(a) || d.endsWith("." + normalize(a)))) return "allowed"
  return "unlisted"
}
