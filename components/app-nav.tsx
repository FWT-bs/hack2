"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Lock, Home, MessageSquare, Users, History, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/rooms", label: "Rooms", icon: MessageSquare },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/history", label: "History", icon: History },
] as const

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?"

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/home" className="flex items-center gap-2 shrink-0 hover:opacity-80">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Lock className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight hidden sm:inline">LockIn</span>
          </Link>

          <nav className="flex items-center gap-1 flex-1 justify-center">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-1.5 rounded-xl",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-full h-8 w-8 border-0 bg-transparent p-0 hover:bg-accent"
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden border-t border-border bg-background/95 backdrop-blur-md safe-area-pb">
        <div className="flex items-center justify-around h-14">
          <Link href="/home">
            <Button variant="ghost" size="sm" className={cn("rounded-xl", pathname === "/home" && "bg-primary/10 text-primary")}>
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/rooms">
            <Button variant="ghost" size="sm" className={cn("rounded-xl", pathname.startsWith("/rooms") && "bg-primary/10 text-primary")}>
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/friends">
            <Button variant="ghost" size="sm" className={cn("rounded-xl", pathname.startsWith("/friends") && "bg-primary/10 text-primary")}>
              <Users className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm" className={cn("rounded-xl", pathname.startsWith("/settings") && "bg-primary/10 text-primary")}>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </Link>
        </div>
      </nav>
    </>
  )
}
