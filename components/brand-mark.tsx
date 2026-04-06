"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type GlyphState = "focused" | "drifting" | "locked" | "break"

interface BrandMarkProps {
  size?: number
  className?: string
  float?: boolean
  blink?: boolean
  state?: GlyphState
  /** If true, the cutout color is hardcoded #0a0a0a (for non-CSS-var contexts like extension) */
  dark?: boolean
}

/**
 * Glyph — the grouplock brand mascot.
 * A geometric lock-face character: rectangular body, blinking eyes, keyhole mouth.
 * Uses currentColor for the body, so it adapts to any text color context.
 */
export function BrandMark({
  size = 32,
  className = "",
  float = false,
  blink = true,
  state = "focused",
  dark = false,
}: BrandMarkProps) {
  const [blinking, setBlinking] = useState(false)

  useEffect(() => {
    if (!blink) return
    let t: ReturnType<typeof setTimeout>

    function scheduleNext() {
      const delay = 2800 + Math.random() * 5000
      t = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => {
          setBlinking(false)
          scheduleNext()
        }, 110)
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(t)
  }, [blink])

  // Cutout color for eyes / keyhole
  const bg = dark ? "#0a0a0a" : "var(--background, #0a0a0a)"

  // Eye dimensions change with state + blink
  const eyeH = blinking
    ? 0.4
    : state === "locked"
    ? 1.2
    : state === "break"
    ? 0.8
    : 3.8

  // Eyes drift right when "drifting"
  const eyeDx = state === "drifting" ? 1.8 : 0

  // Eyes shift down when "locked" (heavy-lidded)
  const eyeDy = state === "locked" ? 0.8 : 0

  return (
    <svg
      width={size}
      height={Math.round(size * 44 / 36)}
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(float && "animate-float", className)}
      aria-label="grouplock"
      role="img"
    >
      {/* ── Shackle (the "hair") ── */}
      <path
        d="M11.5 19V13.5a6.5 6.5 0 0113 0V19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Lock body (the face) ── */}
      <rect x="4" y="19" width="28" height="21" rx="3" fill="currentColor" />

      {/* ── Left eye ── */}
      <rect
        x={8.5 + eyeDx}
        y={24.5 + eyeDy}
        width={5.5}
        height={eyeH}
        rx="0.8"
        fill={bg}
        style={{ transition: "height 0.09s ease, y 0.12s ease" }}
      />

      {/* ── Right eye ── */}
      <rect
        x={22 + eyeDx}
        y={24.5 + eyeDy}
        width={5.5}
        height={eyeH}
        rx="0.8"
        fill={bg}
        style={{ transition: "height 0.09s ease, y 0.12s ease" }}
      />

      {/* ── Keyhole (the "mouth") ── */}
      <circle cx="18" cy="34.5" r="2.4" fill={bg} />
      <rect x="16.7" y="33" width="2.6" height="4" rx="0" fill={bg} />
    </svg>
  )
}

/** Small inline brand icon — lock mark only, no face. For tight spaces. */
export function BrandIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="7" width="12" height="8" rx="2" fill="currentColor" />
      <path
        d="M5 7V5.5a3 3 0 016 0V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="6" y="9.5" width="4" height="1.2" rx="0.5" fill="var(--background, #0a0a0a)" />
    </svg>
  )
}
