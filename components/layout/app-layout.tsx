"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Mobile Navigation Sheet */}
        <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          <Header onMenuClick={() => setMobileNavOpen(true)} />

          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}