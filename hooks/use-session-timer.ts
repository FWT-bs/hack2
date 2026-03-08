"use client"

import { useEffect, useState, useCallback } from "react"

export function useSessionTimer(startedAt: string, durationMinutes: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  const calculate = useCallback(() => {
    const start = new Date(startedAt).getTime()
    const end = start + durationMinutes * 60 * 1000
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((end - now) / 1000))
    setRemainingSeconds(remaining)
    setIsExpired(remaining === 0)
  }, [startedAt, durationMinutes])

  useEffect(() => {
    calculate()
    const interval = setInterval(calculate, 1000)
    return () => clearInterval(interval)
  }, [calculate])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const progress = 1 - remainingSeconds / (durationMinutes * 60)

  return { remainingSeconds, isExpired, formatted, progress, minutes, seconds }
}
