"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Home, MessageSquare, Users, History, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BrandIcon } from "@/components/brand-mark"
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "?"
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] || (user?.email ? user.email.split("@")[0] : null)

  return (
    <>
      {/* Desktop */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
          <Link href="/home" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity duration-200 group">
            <BrandIcon size={14} className="text-foreground" />
            <span className="font-semibold text-sm tracking-tight">grouplock</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link key={href} href={href}>
                  <button className={cn(
                    "flex items-center gap-1.5 px-3 h-8 rounded-sm text-xs font-medium transition-colors duration-200",
                    active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                </Link>
              )
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-sm h-7 w-7 bg-muted hover:bg-accent transition-colors duration-200" aria-label="Account">
              <Avatar className="h-7 w-7 rounded-sm">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-[10px] font-medium rounded-sm">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-sm">
              <div className="px-3 py-2">
                <p className="font-medium text-sm truncate">{firstName || "Account"}</p>
                {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
              </div>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem><Settings className="mr-2 h-3.5 w-3.5" />Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-3.5 w-3.5" />Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 md:hidden border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-around h-12">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href} className="flex-1">
                <button className={cn(
                  "flex flex-col items-center gap-0.5 w-full py-1 transition-colors duration-200",
                  active ? "text-foreground" : "text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                  <span className="text-[9px] font-medium">{label}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
