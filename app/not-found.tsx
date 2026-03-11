import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">404</h1>
          <p className="text-muted-foreground text-sm">
            This page doesn&apos;t exist — maybe it got blocked? 🔒
          </p>
        </div>
        <Link href="/">
          <Button className="font-semibold">Back to LockIn</Button>
        </Link>
      </div>
    </div>
  )
}
