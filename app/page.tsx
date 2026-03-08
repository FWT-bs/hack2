import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">LockIn</span>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/room" className="hover:text-foreground transition-colors">
              Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="container max-w-6xl mx-auto px-4 py-20 md:py-28 relative">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Focus with your team. Stay accountable.
              </h1>
              <p className="mt-5 text-lg text-muted-foreground text-pretty">
                LockIn tracks focus during study or work sessions. Get gentle nudges when you wander,
                and unlock with your group when you need a break.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/room">
                  <Button size="lg" className="gap-2">
                    Open demo room
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how">How it works</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="container max-w-6xl mx-auto px-4 py-16 md:py-24">
          <h2 className="text-2xl font-semibold mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">Focus tracking</h3>
              <p className="text-sm text-muted-foreground">
                Our browser extension reports the tab you’re on. Allowed and blocked sites keep you on task.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">Gentle lock</h3>
              <p className="text-sm text-muted-foreground">
                Off-task too long? A lock overlay appears. Return to an allowed site or request a break from your group.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">Group accountability</h3>
              <p className="text-sm text-muted-foreground">
                Chat and see who’s on task. Break requests go to peers for approval so everyone stays in sync.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          LockIn — demo. Install the Chrome extension to check your current tab from the app.
        </div>
      </footer>
    </div>
  )
}
