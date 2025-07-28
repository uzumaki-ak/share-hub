import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShareSpace - Modern Resource Sharing Platform",
  description: "Share, rent, and discover resources in your community",
   
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-slate-950 text-slate-100`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
