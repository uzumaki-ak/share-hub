"use client"

import type React from "react"

import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-4 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  )
}
