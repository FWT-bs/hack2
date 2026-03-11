"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? "/home"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    const supabase = createClient()
    const redirectUrl =
      typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : redirectTo
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
    if (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2 text-foreground hover:opacity-80">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">LockIn</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-center mb-6">Sign in</h1>

          <div className="space-y-3 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl gap-2 justify-center hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              <Chrome className="h-4 w-4" />
              {googleLoading ? "Connecting to Google…" : "Continue with Google"}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>or continue with email</span>
              <span className="flex-1 h-px bg-border" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
