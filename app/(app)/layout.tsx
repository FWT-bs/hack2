import { AppNav } from "@/components/app-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  )
}
