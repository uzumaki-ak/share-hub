"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { ItemCardSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { itemsApi, notificationsApi } from "@/lib/api"
import type { Item, Notification } from "@/lib/types"
import { Plus, Package, Bell, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useUser()
  const [userItems, setUserItems] = useState<Item[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeListings: 0,
    totalEarnings: 0,
    upcomingBookings: 0,
    unreadNotifications: 0,
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [items, notifs] = await Promise.all([itemsApi.getUserItems(user!.id), notificationsApi.getByUser(user!.id)])

      setUserItems(items)
      setNotifications(notifs)

      // Calculate stats
      setStats({
        activeListings: items.filter((item) => item.available).length,
        totalEarnings: items.reduce((sum, item) => sum + item.price * 0.1, 0), // Mock calculation
        upcomingBookings: 3, // Mock data
        unreadNotifications: notifs.filter((n) => !n.read).length,
      })
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-lg p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-slate-900 rounded-lg p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Welcome back, {user?.firstName}!</h1>
            <p className="text-slate-400 mt-1">Here's what's happening with your listings</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/listings/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Active Listings</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.activeListings}</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-100">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Upcoming Bookings</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.upcomingBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Notifications</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.unreadNotifications}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Listings */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-100">Your Active Listings</span>
                <Link href="/listings" className="text-blue-400 hover:text-blue-300 text-sm">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userItems.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No listings yet"
                  description="Create your first listing to start sharing with the community"
                  action={{
                    label: "Create Listing",
                    href: "/listings/new",
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {userItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <img
                        src={item.images[0] || "/placeholder.svg?height=60&width=60"}
                        alt={item.title}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-100 truncate">{item.title}</h3>
                        <p className="text-xs text-slate-400 truncate">{item.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={item.type === "RENT" ? "default" : item.type === "SELL" ? "secondary" : "outline"}
                          >
                            {item.type}
                          </Badge>
                          <span className="text-sm font-medium text-slate-100">${item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-slate-100">Recent Notifications</span>
                <Link href="/notifications" className="text-blue-400 hover:text-blue-300 text-sm">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No notifications"
                  description="You're all caught up! New notifications will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.read ? "bg-slate-800 border-slate-600" : "bg-blue-900/20 border-blue-400"
                      }`}
                    >
                      <h4 className="text-sm font-medium text-slate-100">{notification.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{notification.content}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
