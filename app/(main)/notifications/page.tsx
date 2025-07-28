"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { notificationsApi } from "@/lib/api"
import type { Notification } from "@/lib/types"
import { Bell, MessageCircle, Calendar, Gavel, Heart, Settings, Check, CheckCheck } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"

export default function NotificationsPage() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const notificationsData = await notificationsApi.getByUser(user!.id)
      setNotifications(notificationsData)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead(user!.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MESSAGE":
        return <MessageCircle className="w-5 h-5 text-blue-400" />
      case "BOOKING":
        return <Calendar className="w-5 h-5 text-green-400" />
      case "RETURN":
        return <Calendar className="w-5 h-5 text-orange-400" />
      case "BID":
        return <Gavel className="w-5 h-5 text-purple-400" />
      case "MATCH":
        return <Heart className="w-5 h-5 text-red-400" />
      default:
        return <Bell className="w-5 h-5 text-slate-400" />
    }
  }

  const filteredNotifications = notifications.filter((n) => filter === "all" || !n.read)

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-800 rounded w-48 mb-2"></div>
              <div className="h-4 bg-slate-800 rounded w-64"></div>
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-lg p-4">
                <div className="animate-pulse flex items-start space-x-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Notifications</h1>
            <p className="text-slate-400 mt-1">Stay updated with your activity</p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="border-slate-700 text-slate-300 bg-transparent"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {unreadCount} unread
            </Badge>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-blue-600" : "border-slate-700 text-slate-300 bg-transparent"}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
            className={filter === "unread" ? "bg-blue-600" : "border-slate-700 text-slate-300 bg-transparent"}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Bell}
                  title={filter === "unread" ? "No unread notifications" : "No notifications"}
                  description={filter === "unread" ? "You're all caught up!" : "New notifications will appear here"}
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-800/50 transition-colors ${
                      !notification.read ? "bg-blue-900/10 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`text-sm font-medium ${
                                !notification.read ? "text-slate-100" : "text-slate-300"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">{notification.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-slate-500">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                              {notification.actionUrl && (
                                <Link
                                  href={notification.actionUrl}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                  onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                  View Details →
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                                className="text-slate-400 hover:text-slate-100"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <div
                              className={`w-2 h-2 rounded-full ${
                                !notification.read ? "bg-blue-500" : "bg-transparent"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-100">
              <Settings className="w-5 h-5 mr-2" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-100">New Messages</h4>
                  <p className="text-xs text-slate-400">Get notified when someone sends you a message</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-100">Booking Updates</h4>
                  <p className="text-xs text-slate-400">Get notified about booking confirmations and changes</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-100">Return Reminders</h4>
                  <p className="text-xs text-slate-400">Get reminded when items are due for return</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-100">Bid Updates</h4>
                  <p className="text-xs text-slate-400">Get notified about auction bids and wins</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-100">Item Matches</h4>
                  <p className="text-xs text-slate-400">Get notified when items matching your interests are listed</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
