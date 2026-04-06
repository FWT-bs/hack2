"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  ArrowDown,
  Users,
  Chrome,
  Shield,
  Eye,
  Timer,
  MessageSquare,
  Activity,
  Zap,
} from "lucide-react"
import { BrandMark, BrandIcon, type GlyphState } from "@/components/brand-mark"

/* ─── Scroll reveal ─────────────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: ReactNode
  delay?: number
  className?: string
  direction?: "up" | "right" | "left" | "scale" | "none"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
      },
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const transforms: Record<string, string> = {
    up: "translateY(28px)",
    right: "translateX(32px)",
    left: "translateX(-32px)",
    scale: "scale(0.94)",
    none: "none",
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.72s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.72s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Floating Glyph that appears on scroll ─────────────────────────────────── */
function ScrollGlyph({
  size = 48,
  state = "focused",
  delay = 0,
  direction = "right",
  className = "",
}: {
  size?: number
  state?: GlyphState
  delay?: number
  direction?: "left" | "right"
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const fromX = direction === "right" ? 40 : -40

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateX(${fromX}px)`,
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <BrandMark size={size} state={state} float className="text-foreground/80" />
    </div>
  )
}

/* ─── Glyph state showcase ──────────────────────────────────────────────────── */
function GlyphStateCard({
  state,
  label,
  desc,
  delay = 0,
}: {
  state: GlyphState
  label: string
  desc: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="bg-card border border-border rounded-sm p-5 flex flex-col items-center gap-3 text-center hover:bg-muted/40 transition-colors duration-300 group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(20px) scale(0.96)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <BrandMark
        size={40}
        state={state}
        float={state === "focused"}
        className="text-foreground group-hover:scale-110 transition-transform duration-300"
      />
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}

/* ─── Live room terminal ────────────────────────────────────────────────────── */
function RoomTerminal() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % 5), 2400)
    return () => clearInterval(t)
  }, [])

  const lines = [
    { time: "00:00", text: "room created — algorithms sprint", dim: true },
    { time: "00:12", text: "alex joined the room", dim: true },
    { time: "00:45", text: "sam: keep me honest, doing DP", dim: false },
    { time: "03:22", text: "alex drifted to youtube.com", dim: false },
    { time: "03:25", text: "alex returned — back on task", dim: true },
  ]

  const members = [
    { name: "You", active: true },
    { name: "Alex", active: step !== 3 },
    { name: "Sam", active: true },
  ]

  return (
    <div className="border border-border rounded-sm overflow-hidden font-mono text-xs select-none">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-foreground/20" />
            <span className="w-2 h-2 rounded-full bg-foreground/20" />
            <span className="w-2 h-2 rounded-full bg-foreground/20" />
          </div>
          <span className="text-foreground/70 tracking-tight">ALGO-SPRINT</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />3</span>
          <span className="text-foreground tabular-nums font-semibold">42:17</span>
        </div>
      </div>

      <div className="h-px bg-border relative">
        <div
          className="absolute inset-y-0 left-0 bg-foreground/20 transition-all duration-1000"
          style={{ width: `${20 + step * 8}%` }}
        />
      </div>

      <div className="grid grid-cols-[1fr_120px] min-h-[200px]">
        <div className="p-3 space-y-1 border-r border-border">
          {lines.map((line, i) => (
            <div
              key={i}
              className="flex gap-2 items-start transition-all duration-500"
              style={{ opacity: i <= step ? 1 : 0.15, transform: i <= step ? "none" : "translateY(2px)" }}
            >
              <span className="text-muted-foreground tabular-nums shrink-0 w-10">{line.time}</span>
              <span className={line.dim ? "text-muted-foreground" : "text-foreground"}>{line.text}</span>
            </div>
          ))}
        </div>

        <div className="p-3 space-y-2">
          <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">Members</span>
          {members.map(m => (
            <div key={m.name} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-500 ${m.active ? "bg-foreground" : "bg-foreground/30 animate-pulse-slow"}`} />
              <span className={m.active ? "text-foreground" : "text-muted-foreground"}>{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-muted-foreground">goal: 6 LC mediums, no socials</span>
        <span className="text-foreground/50 text-[9px] uppercase tracking-wider">youtube blocked</span>
      </div>
    </div>
  )
}

/* ─── Feature item ──────────────────────────────────────────────────────────── */
function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="group py-6 border-b border-border last:border-0 flex gap-4 items-start">
      <div className="w-8 h-8 rounded-sm border border-border flex items-center justify-center shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    const supabase = createClient()
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/home` : "/home"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
    if (error) { setGoogleLoading(false); console.error(error.message) }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandIcon size={16} className="text-foreground group-hover:opacity-70 transition-opacity duration-200" />
            <span className="font-semibold text-sm tracking-tight group-hover:opacity-70 transition-opacity duration-200">grouplock</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
            <Link href="#how" className="hover:text-foreground transition-colors duration-200">How it works</Link>
            <Link href="#features" className="hover:text-foreground transition-colors duration-200">Features</Link>
            <Link href="#extension" className="hover:text-foreground transition-colors duration-200">Extension</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200">
              Sign in
            </Link>
            <Button size="sm" className="h-8 px-4 rounded-sm text-xs font-medium" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(250,250,250,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 w-full relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-20 items-center">

            <div className="space-y-8">
              <Reveal direction="none">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground border border-border rounded-sm px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse-slow" />
                  Live accountability
                </div>
              </Reveal>

              {/* Brand character — visible on mobile, hidden on lg (shown in right column area) */}
              <div className="lg:hidden flex justify-start">
                <BrandMark size={52} float blink className="text-foreground" />
              </div>

              <Reveal direction="up" delay={80}>
                <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-bold tracking-[-0.035em] leading-[1.08]">
                  Focus hits different when the room can see you drift.
                </h1>
              </Reveal>

              <Reveal direction="up" delay={160}>
                <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                  Shared focus rooms with live presence, gentle blocking, and a Chrome extension
                  that notices when you wander. Not surveillance — social gravity.
                </p>
              </Reveal>

              <Reveal direction="up" delay={240}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="h-11 px-6 rounded-sm gap-2 text-sm font-medium"
                    onClick={() => setAuthOpen(true)}
                  >
                    Create a room <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-6 rounded-sm gap-2 text-sm"
                    asChild
                  >
                    <Link href="#how">
                      See how it works <ArrowDown className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal direction="up" delay={320}>
                <div className="flex items-center gap-6 text-[11px] text-muted-foreground pt-1">
                  {[
                    { icon: Shield, text: "Open source" },
                    { icon: Eye, text: "Session-only tracking" },
                    { icon: Zap, text: "Free" },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3" />{text}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right column — terminal + floating Glyph */}
            <div className="hidden lg:flex flex-col gap-6 items-end relative">
              {/* Glyph mascot floating above terminal */}
              <div
                className="self-center mb-2"
                style={{
                  animation: "fade-in-up 0.9s 0.4s cubic-bezier(0.22,1,0.36,1) both",
                }}
              >
                <BrandMark size={56} float blink className="text-foreground" />
              </div>
              <div style={{ animation: "fade-in-up 0.8s 0.2s cubic-bezier(0.22,1,0.36,1) both", width: "100%" }}>
                <RoomTerminal />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Link href="#how" className="flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-300">
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono">Scroll</span>
            <ArrowDown className="h-3.5 w-3.5 animate-glyph-bob" />
          </Link>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground mb-3">How it works</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            <div className="md:sticky md:top-24 md:self-start space-y-6">
              <Reveal direction="left">
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] leading-tight">
                  A study session<br />that holds you to it.
                </h2>
              </Reveal>
              <Reveal delay={80} direction="left">
                <p className="text-muted-foreground leading-relaxed">
                  From room creation to session complete. Every state is visible, every drift is noticed,
                  every recovery is shared.
                </p>
              </Reveal>
              <Reveal delay={150} direction="left">
                <Button className="rounded-sm gap-2 h-10 text-sm" onClick={() => setAuthOpen(true)}>
                  Try it now <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Reveal>

              {/* Glyph mascot in sticky left column */}
              <ScrollGlyph
                size={44}
                state="focused"
                delay={200}
                direction="left"
                className="pt-4"
              />
            </div>

            <div className="space-y-0">
              {[
                { num: "01", title: "Create a room. Set the rules.", desc: "Name your session, set a goal and duration, define which sites are allowed and blocked. Share the link." },
                { num: "02", title: "Study together. The room is watching.", desc: "Live chat, shared timers, and member presence. Everyone sees who's on task and who's drifting." },
                { num: "03", title: "Someone opens YouTube.", desc: "The extension detects the blocked domain and flags it. A calm overlay nudges them back. No alarms — just social gravity." },
                { num: "04", title: "Request a break. Or get back to work.", desc: "Need a breather? Request one and let the group decide. The room stays honest without being rigid." },
                { num: "05", title: "Session complete. Together.", desc: "The timer runs out. The room closes. Everyone held each other accountable, and the work is done." },
              ].map(({ num, title, desc }, i) => (
                <Reveal key={num} delay={i * 70} direction="right">
                  <div className="py-8 border-b border-border last:border-0">
                    <span className="text-[11px] font-mono text-muted-foreground tracking-wider">{num}</span>
                    <h3 className="text-xl font-semibold tracking-tight mt-2 mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Glyph state showcase ──────────────────────────────────────────── */}
      <section className="py-16 border-t border-border bg-muted/20">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-10">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Glyph — your focus companion</p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GlyphStateCard state="focused"  label="On task"   desc="Calm. Locked in." delay={0} />
            <GlyphStateCard state="drifting" label="Drifting"  desc="The room noticed." delay={80} />
            <GlyphStateCard state="locked"   label="Blocked"   desc="Come back." delay={160} />
            <GlyphStateCard state="break"    label="On break"  desc="Approved pause." delay={240} />
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="space-y-3 mb-12">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em]">
              Accountability without surveillance.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-x-12">
            <div>
              <Reveal direction="left"><Feature icon={Users} title="Live presence" description="See who's in the room, who's focused, who's drifting. Shared states create shared accountability." /></Reveal>
              <Reveal delay={50} direction="left"><Feature icon={Eye} title="Focus monitoring" description="The Chrome extension checks your active tab against the room's blocklist. Transparent, session-scoped, rule-based." /></Reveal>
              <Reveal delay={100} direction="left"><Feature icon={Shield} title="Gentle blocking" description="Drift to a blocked site and a calm overlay nudges you back. No harsh alarms. The room noticed — that's enough." /></Reveal>
            </div>
            <div>
              <Reveal delay={50} direction="right"><Feature icon={MessageSquare} title="Session chat" description="Coordinate sprints, share progress, call each other out. Messages and room events in one feed." /></Reveal>
              <Reveal delay={100} direction="right"><Feature icon={Timer} title="Shared timers" description="Set durations, see time remaining, build a rhythm. Sprint, rest, repeat." /></Reveal>
              <Reveal delay={150} direction="right"><Feature icon={Activity} title="Break requests" description="Need a breather? Request one from the room. Keeps everyone honest without being controlling." /></Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Extension ─────────────────────────────────────────────────────── */}
      <section id="extension" className="py-24 md:py-32 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-start">
            <Reveal direction="left">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">Chrome extension</p>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] leading-tight">
                  The bridge between<br />intent and accountability.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Runs only during active sessions. Checks your current tab against the room&apos;s shared
                  blocklist. Shows a calm overlay when you wander. No background tracking. No data
                  collection outside sessions.
                </p>
                {/* Extension Glyph */}
                <div className="pt-2">
                  <BrandMark size={36} state="focused" float blink className="text-foreground/60" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={80} direction="right">
              <div className="border border-border rounded-sm divide-y divide-border">
                {[
                  { label: "Session-only", detail: "Active only when you're in a room. Sleeps otherwise." },
                  { label: "Shared rules", detail: "Everyone in the room sees the same allow/block list." },
                  { label: "Soft enforcement", detail: "An overlay, not a hard block. You can always close it." },
                  { label: "Tab-level only", detail: "Checks the domain. Never reads page content or keystrokes." },
                ].map(({ label, detail }) => (
                  <div key={label} className="px-5 py-4 hover:bg-muted/40 transition-colors duration-200">
                    <p className="text-sm font-semibold mb-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The principle ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal direction="none">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-2">
                <BrandMark size={52} state="focused" float blink className="text-foreground animate-glyph-wander" />
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-muted-foreground">The principle</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-[-0.035em] leading-tight">
                A room that notices<br />when you drift.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Not a productivity app. Not a timer. Not a to-do list.
                A shared space with social gravity — where focus is the default
                because the room is real and the people in it are watching.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal direction="scale">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.04em]">
                Ready to lock in?
              </h2>
              <p className="text-base text-muted-foreground max-w-sm mx-auto">
                Create your first focus room. Free, open source, no credit card.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="h-11 px-8 rounded-sm gap-2 text-sm font-medium"
                  onClick={() => setAuthOpen(true)}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
                <Button variant="outline" className="h-11 px-8 rounded-sm text-sm" asChild>
                  <Link href="/signup">Sign up with email</Link>
                </Button>
              </div>
              <div className="pt-4 flex justify-center">
                <BrandMark size={32} state="focused" blink className="text-muted-foreground/40" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BrandIcon size={14} className="text-muted-foreground" />
              <span className="font-semibold text-sm tracking-tight">grouplock</span>
            </Link>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors duration-200">Sign in</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors duration-200">Sign up</Link>
              <a href="https://github.com/FWT-bs/hack2" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors duration-200">GitHub</a>
              <Link href="/preview" className="hover:text-foreground transition-colors duration-200">Preview</Link>
            </div>
            <p className="text-[11px] text-muted-foreground">MIT · Next.js · Supabase</p>
          </div>
        </div>
      </footer>

      {/* ── Auth dialog ───────────────────────────────────────────────────── */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-sm rounded-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <BrandMark size={24} blink className="text-foreground" />
              <DialogTitle className="font-semibold">Get started</DialogTitle>
            </div>
            <DialogDescription>Sign in to create or join a focus room.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button className="w-full rounded-sm gap-2 h-10" onClick={handleGoogleAuth} disabled={googleLoading}>
              <Chrome className="h-4 w-4" />
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>or</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <Button variant="outline" className="w-full rounded-sm h-10" asChild>
              <Link href="/signup" onClick={() => setAuthOpen(false)}>Sign up with email</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Have an account?{" "}
              <Link href="/login" onClick={() => setAuthOpen(false)} className="text-foreground hover:underline">Sign in</Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
