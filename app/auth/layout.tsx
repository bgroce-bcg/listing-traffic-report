import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - Traffic Report",
  description: "Sign in to manage your real estate listings",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}