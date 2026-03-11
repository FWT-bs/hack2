"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  Shield,
  Users,
  Zap,
  Chrome,
  Lock,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react"

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  direction?: "up" | "right"
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const animName = direction === "right" ? "fade-in-right" : "fade-in-up"

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? undefined : 0,
        animation: visible
          ? `${animName} 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`
          : undefined,
      }}
    >
      {children}
    </div>
  )
}

// ── Animated blob background ──────────────────────────────────────────────────
function BlobBg() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-36 -left-36 w-[720px] h-[720px] bg-primary/14 rounded-full blur-3xl animate-blob-1" />
      <div className="absolute -bottom-40 -right-40 w-[680px] h-[680px] bg-primary/10 rounded-full blur-3xl animate-blob-2" />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  )
}

// ── Room preview ──────────────────────────────────────────────────────────────
function RoomPreview() {
  return (
    <div id="preview" className="relative animate-float scroll-mt-20" style={{ animationDelay: "0.4s" }}>
      {/* Layered glow */}
      <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full -z-10" />
      <div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-full -z-10" />

      <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
        {/* Room header bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/10">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold">📚 Algorithms · Focus Room</span>
          <div className="flex items-center gap-2 ml-auto">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">3/6</span>
            <span className="text-xs font-mono font-bold ml-1 text-foreground">42:17</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-border/30">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: "30%" }} />
        </div>

        {/* Body */}
        <div className="flex">
          {/* Chat */}
          <div className="flex-1 p-3 space-y-2.5 border-r border-border/40">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Chat</p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                on task
              </span>
            </div>
            <div className="flex gap-2 items-end">
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">AL</div>
              <div className="rounded-2xl rounded-bl-none bg-muted px-2.5 py-1.5 text-xs max-w-[170px]">25 min sprint? phones down 😅</div>
            </div>
            <div className="flex gap-2 items-end justify-end">
              <div className="rounded-2xl rounded-br-none bg-primary px-2.5 py-1.5 text-xs text-primary-foreground max-w-[220px]">yes. i&apos;m doing DP problems. keep me honest 🙏</div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center text-[8px] text-white font-bold shrink-0">SA</div>
              <div className="rounded-2xl rounded-bl-none bg-muted px-2.5 py-1.5 text-xs max-w-[220px]">if anyone opens YouTube we roast them 😂</div>
            </div>
          </div>

          {/* Members */}
          <div className="w-28 p-3 space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Members</p>
            {[
              { initials: "YO", name: "You", bg: "bg-primary", dot: "bg-emerald-400" },
              { initials: "AL", name: "Alex", bg: "bg-indigo-500", dot: "bg-emerald-400" },
              { initials: "SA", name: "Sam", bg: "bg-violet-500", dot: "bg-primary" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-1.5">
                <div className="relative shrink-0">
                  <div className={`w-5 h-5 rounded-full ${m.bg} flex items-center justify-center text-[8px] text-white font-bold`}>{m.initials}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${m.dot} border border-card`} />
                </div>
                <span className="text-[10px] truncate font-medium">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border/40 bg-muted/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Goal</p>
              <p className="text-xs font-medium truncate">Finish 6 LeetCode mediums · no socials</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
              YouTube blocked
            </span>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div
        className="absolute -top-3 -right-2 rounded-full bg-emerald-500 text-white text-[10px] px-2.5 py-1 font-semibold shadow-lg flex items-center gap-1.5 animate-slide-down"
        style={{ animationDelay: "1s" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        On Task
      </div>
      <div
        className="absolute -bottom-3 -left-2 rounded-full border border-border/60 bg-card text-[10px] px-2.5 py-1 font-medium shadow-lg flex items-center gap-1.5 text-foreground animate-slide-down"
        style={{ animationDelay: "1.3s" }}
      >
        <Lock className="h-2.5 w-2.5 text-primary" />
        Focus mode active
      </div>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType
  title: string
  description: string
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm p-6 space-y-4 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-2 transition-all duration-300 cursor-default">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
          {step}
        </div>
        {step < 3 && <div className="w-px flex-1 bg-border mt-2 min-h-[24px]" />}
      </div>
      <div className="pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AVATAR_NAMES = ["taylor", "jordan", "casey", "morgan", "riley"]

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    const supabase = createClient()
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/home` : "/home"
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
    if (error) {
      // For now we just stop the loading state; surface details on dedicated auth pages.
      setGoogleLoading(false)
      // eslint-disable-next-line no-console
      console.error(error.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Header ── */}
      <header className="bg-background sticky top-0 z-20 border-b border-border/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Lock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">LockIn</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="hidden sm:inline-flex gap-1.5 rounded-xl px-4 h-10 font-semibold hover:shadow-lg hover:shadow-primary/15 transition-all duration-300"
              asChild
            >
              <Link href="/signup">
                Find your study group
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex rounded-xl h-10 px-4"
              asChild
            >
              <Link href="#preview">Preview a study room</Link>
            </Button>
            <Button
              size="sm"
              className="sm:hidden gap-1.5 rounded-xl h-10 px-3"
              asChild
            >
              <Link href="/signup">
                Find group
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center">
          <BlobBg />

          <div className="container max-w-6xl mx-auto px-4 py-16 md:py-22 w-full">
            <div className="grid gap-12 lg:gap-16 md:grid-cols-[1.05fr_1fr] items-center">

              {/* Left: floating text — NO container */}
              <div className="space-y-7 animate-fade-in-up">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-foreground/80 animate-fade-in"
                  style={{ animationDelay: "100ms" }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Study rooms with real accountability
                </div>

                {/* Giant typography */}
                <div className="space-y-2">
                  <h1
                    className="text-[clamp(2.4rem,4.8vw,3.6rem)] font-extrabold tracking-tight leading-[1.02] animate-fade-in-up text-balance"
                    style={{ animationDelay: "150ms" }}
                  >
                    Focus with friends,
                    <span className="text-primary"> for real.</span>
                  </h1>
                </div>

                <p
                  className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up"
                  style={{ animationDelay: "250ms" }}
                >
                  Start a study room, set a goal, and keep each other on track. LockIn gives you gentle
                  nudges when you drift and a little social pressure when you need it, so homework actually gets done.
                </p>

                {/* CTA buttons */}
                <div
                  className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
                  style={{ animationDelay: "350ms" }}
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-semibold rounded-2xl px-5 h-12 hover:shadow-xl hover:shadow-primary/18 hover:-translate-y-0.5 transition-all duration-300"
                    onClick={() => setAuthOpen(true)}
                  >
                    Find your study group
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link href="#preview" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full gap-2 rounded-2xl px-5 h-12 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Preview a study room
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Social proof */}
                <div
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: "450ms" }}
                >
                  <div className="flex -space-x-2.5">
                    {AVATAR_NAMES.map((name, i) => (
                      <img
                        key={name}
                        src={`https://i.pravatar.cc/32?u=${name}`}
                        alt={`${name} studying`}
                        className="w-8 h-8 rounded-full border-2 border-background object-cover"
                        style={{ zIndex: 5 - i }}
                      />
                    ))}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">1,240+ studying right now</p>
                    <p className="text-[10px] text-muted-foreground">Join them in seconds</p>
                  </div>
                </div>
              </div>

              {/* Right: room preview floating — no container */}
              <div
                className="animate-fade-in-right hidden md:block"
                style={{ animationDelay: "200ms" }}
              >
                <RoomPreview />

                {/* Mini feature pills */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                  {[
                    { icon: CheckCircle2, label: "Group accountability", sub: "Shared goal + small social pressure", color: "text-foreground", bg: "bg-muted" },
                    { icon: Users, label: "Friend groups, not managers", sub: "Soft nudges and shared goals", color: "text-primary", bg: "bg-primary/10" },
                  ].map(({ icon: Icon, label, sub, color, bg }) => (
                    <div
                      key={label}
                      className="flex gap-2.5 items-start p-3 rounded-xl bg-card/55 backdrop-blur-sm border border-border/30 hover:border-primary/35 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className={`mt-0.5 rounded-lg ${bg} p-1.5 shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-semibold">{label}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── floating numbers, no visible container ── */}
        <Reveal className="py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap items-end justify-center gap-12 md:gap-20">
              {[
                { value: "1,240+", label: "Students online" },
                { value: "32K",    label: "Sessions this week" },
                { value: "92%",    label: "On-task rate" },
                { value: "< 5 min", label: "Avg to join" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="text-center space-y-1"
                  style={{ animation: `fade-in-up 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms both` }}
                >
                  <p className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── What makes LockIn different ── */}
        <section className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <Reveal className="text-center space-y-2 mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">What makes LockIn different</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">For friend groups, not managers</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              It&apos;s about soft nudges and shared goals. You see when friends are studying, hop into a room together, and gently keep each other on track.
            </p>
          </Reveal>
        </section>

        {/* ── Features ── */}
        <section className="container max-w-6xl mx-auto px-4 py-16 md:py-20">
          <Reveal className="text-center space-y-2 mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it helps</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Accountability that feels friendly</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              You set the vibe. LockIn keeps the room focused with small check-ins and gentle blocking that respects you.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Zap, title: "Focus check-ins",
                description: "Tap 'Check my focus' to instantly see if your current tab is allowed, blocked, or a grey area — powered by the extension.",
                iconBg: "bg-primary/10", iconColor: "text-primary", delay: 0,
              },
              {
                icon: Shield, title: "Gentle locks",
                description: "When you drift to a blocked site, a soft overlay takes over and nudges you back — no harsh alarm, just a friendly reminder.",
                iconBg: "bg-primary/10", iconColor: "text-primary", delay: 80,
              },
              {
                icon: Users, title: "Friends, not bosses",
                description: "Everyone in the room sees the same allowed/blocked lists and can update them together. Collaborative accountability, not surveillance.",
                iconBg: "bg-muted", iconColor: "text-foreground", delay: 160,
              },
            ].map(({ delay, ...card }) => (
              <Reveal key={card.title} delay={delay}>
                <FeatureCard {...card} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-16 md:py-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <Reveal>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Get started in 3 steps</p>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Up and running in minutes</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No long onboarding. Just you, your study group, and a timer.
                  </p>
                </div>
              </Reveal>

              <Reveal direction="right" delay={100}>
                <div className="space-y-0">
                  <StepCard step={1} icon={Users} title="Join or create a study room"
                    description="Start a room, invite friends, set your session goal and duration. Pick your blocked and allowed sites together." />
                  <StepCard step={2} icon={BookOpen} title="Study together"
                    description="Chat, check in, and stay on task. If you drift, your group will notice and gently bring you back." />
                  <StepCard step={3} icon={Chrome} title="Optional: install the extension"
                    description="When you start a focus session, the extension can show a gentle overlay on distracting tabs. It only runs during sessions — not 24/7." />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Extension (optional helper) ── */}
        <section className="py-16 md:py-20 border-t border-border/30">
          <div className="container max-w-6xl mx-auto px-4">
            <Reveal className="text-center space-y-2 mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Optional</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">A gentle extension that has your back</h2>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                When you start a focus room, the LockIn extension can notice when you wander to certain sites, show a soft overlay on that tab, and log oops-moments into your room recap. It never runs when you&apos;re not in a session.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Join / Auth ── */}
        <section id="join" className="py-16 md:py-20 scroll-mt-16">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-12 items-start">

              {/* Copy — floating, no container */}
              <Reveal>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Join the community</p>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                      Sign in or create your study profile
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Create an account to start a room, invite friends, and keep each other on track.
                    </p>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      "Persistent study rooms with your friend group",
                      "Focus history and streak tracking",
                      "Customisable blocked/allowed site lists",
                      "Break requests approved by your study group",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Auth tabs — glassmorphism card */}
              <Reveal direction="right" delay={120}>
                <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md p-6 shadow-2xl shadow-primary/5">
                  <Tabs defaultValue="login" className="space-y-5">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="login">Sign in</TabsTrigger>
                      <TabsTrigger value="signup">Sign up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                      <div className="space-y-3">
                        <Button
                          type="button"
                          className="w-full font-semibold rounded-xl gap-2 justify-center hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                          size="sm"
                          onClick={handleGoogleAuth}
                          disabled={googleLoading}
                        >
                          <Chrome className="h-4 w-4" />
                          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
                        </Button>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex-1 h-px bg-border" />
                          <span>or continue with email</span>
                          <span className="flex-1 h-px bg-border" />
                        </div>
                        <Button
                          className="w-full font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl"
                          size="sm"
                          asChild
                        >
                          <Link href="/login">Sign in with email</Link>
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      <div className="space-y-3">
                        <Button
                          type="button"
                          className="w-full font-semibold rounded-xl gap-2 justify-center hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
                          size="sm"
                          onClick={handleGoogleAuth}
                          disabled={googleLoading}
                        >
                          <Chrome className="h-4 w-4" />
                          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
                        </Button>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex-1 h-px bg-border" />
                          <span>or continue with email</span>
                          <span className="flex-1 h-px bg-border" />
                        </div>
                        <Button
                          className="w-full font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 rounded-xl"
                          size="sm"
                          asChild
                        >
                          <Link href="/signup">Sign up with email</Link>
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* ── Auth dialog from navbar CTA ── */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a room</DialogTitle>
            <DialogDescription>
              Sign in or create an account to start a study room and invite friends.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              type="button"
              className="w-full font-semibold rounded-xl gap-2 justify-center hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
            >
              <Chrome className="h-5 w-5" />
              {googleLoading ? "Connecting to Google…" : "Continue with Google"}
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>or continue with email</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <Button variant="outline" className="w-full rounded-xl" size="lg" asChild>
              <Link href="/signup" onClick={() => setAuthOpen(false)}>
                Sign up with email
              </Link>
            </Button>
            <Button variant="ghost" className="w-full rounded-xl" size="lg" asChild>
              <Link href="/login" onClick={() => setAuthOpen(false)}>
                Sign in with email
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Footer — minimal floating ── */}
      <footer className="border-t border-border/20">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <Lock className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">LockIn</span>
              <span className="text-muted-foreground text-xs ml-1">— focus with friends</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors duration-200">Sign in</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors duration-200">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
