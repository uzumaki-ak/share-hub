"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  Home,
  Search,
  Map,
  MessageCircle,
  User,
  Plus,
  Calendar,
  Bell,
  Shield,
  Gavel,
  HelpCircle,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Map View", href: "/map", icon: Map },
  { name: "Create Listing", href: "/listings/new", icon: Plus },
  { name: "Messages", href: "/chat", icon: MessageCircle },
  { name: "Rentals", href: "/rentals", icon: Calendar },
  { name: "Auctions", href: "/auctions", icon: Gavel },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Inquiries", href: "/inquiries", icon: HelpCircle },
  { name: "Safety", href: "/safety", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:inset-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-slate-800">
            <Link href="/dashboard" className="text-xl font-bold text-blue-400">
              ShareSpace
            </Link>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={user.imageUrl || "/placeholder.svg"}
                  alt={user.fullName || "User"}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Profile link */}
          <div className="p-4 border-t border-slate-800">
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5 mr-3" />
              My Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
