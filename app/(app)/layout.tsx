import { AppNav } from "@/components/app-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  )
}
