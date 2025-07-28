"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { bookingsApi } from "@/lib/api"
import type { Booking } from "@/lib/types"
import { AlertTriangle, Clock, CheckCircle, Calendar, Package } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

export default function ReturnsPage() {
  const { user } = useUser()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [returnNotes, setReturnNotes] = useState("")
  const [showReturnModal, setShowReturnModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await bookingsApi.getUserBookings(user!.id)
      // Filter for active bookings and overdue items
      const activeBookings = bookingsData.filter((booking) => booking.status === "ACTIVE" || booking.isLate)
      setBookings(activeBookings)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsReturned = async (bookingId: string, isLate = false) => {
    try {
      await bookingsApi.markReturned(bookingId)
      await bookingsApi.update(bookingId, {
        returned: true,
        isLate,
        status: "COMPLETED",
      })
      loadBookings()
      setShowReturnModal(false)
      setReturnNotes("")
    } catch (error) {
      console.error("Failed to mark as returned:", error)
    }
  }

  const isOverdue = (endDate: Date) => {
    return new Date() > new Date(endDate)
  }

  const getDaysOverdue = (endDate: Date) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = today.getTime() - end.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const overdueBookings = bookings.filter((booking) => isOverdue(booking.endDate))
  const dueToday = bookings.filter((booking) => {
    const today = new Date().toDateString()
    return new Date(booking.endDate).toDateString() === today
  })

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-lg p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-800 rounded w-3/4"></div>
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
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Returns Management</h1>
          <p className="text-slate-400 mt-1">Track and manage item returns</p>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <div className="text-2xl font-bold text-red-400 mb-1">{overdueBookings.length}</div>
              <div className="text-sm text-red-300">Overdue Returns</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-900/20 border-yellow-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400 mb-1">{dueToday.length}</div>
              <div className="text-sm text-yellow-300">Due Today</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-700">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400 mb-1">{bookings.length}</div>
              <div className="text-sm text-blue-300">Active Rentals</div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Items */}
        {overdueBookings.length > 0 && (
          <Card className="bg-slate-900 border-red-700">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Overdue Items - Immediate Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueBookings.map((booking) => (
                  <div key={booking.id} className="bg-red-900/10 border border-red-700 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.item.images[0] || "/placeholder.svg?height=60&width=60"}
                        alt={booking.item.title}
                        className="w-15 h-15 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-100">{booking.item.title}</h3>
                            <p className="text-sm text-slate-400">Rented by: {booking.borrower.name}</p>
                          </div>
                          <Badge className="bg-red-600 text-white">
                            {getDaysOverdue(booking.endDate)} days overdue
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-slate-400">Due Date:</span>
                            <div className="text-red-400 font-semibold">
                              {new Date(booking.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400">Total Cost:</span>
                            <div className="text-slate-100">${booking.totalCost.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowReturnModal(true)
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Returned
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-300 bg-transparent"
                          >
                            Contact Borrower
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
                          >
                            Report Issue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Rentals */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.filter((b) => !isOverdue(b.endDate)).length === 0 ? (
              <EmptyState
                icon={Package}
                title="No active rentals"
                description="All your items are currently available"
              />
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter((b) => !isOverdue(b.endDate))
                  .map((booking) => (
                    <div key={booking.id} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={booking.item.images[0] || "/placeholder.svg?height=60&width=60"}
                          alt={booking.item.title}
                          className="w-15 h-15 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-100">{booking.item.title}</h3>
                              <p className="text-sm text-slate-400">Rented by: {booking.borrower.name}</p>
                            </div>
                            <Badge
                              className={
                                new Date(booking.endDate).toDateString() === new Date().toDateString()
                                  ? "bg-yellow-600 text-white"
                                  : "bg-green-600 text-white"
                              }
                            >
                              {new Date(booking.endDate).toDateString() === new Date().toDateString()
                                ? "Due Today"
                                : "Active"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-slate-400">Due Date:</span>
                              <div className="text-slate-100">{new Date(booking.endDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                              <span className="text-slate-400">Days Remaining:</span>
                              <div className="text-slate-100">
                                {Math.ceil(
                                  (new Date(booking.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-400">Total Cost:</span>
                              <div className="text-slate-100">${booking.totalCost.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setShowReturnModal(true)
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Returned
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-700 text-slate-300 bg-transparent"
                            >
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Return Modal */}
        <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Mark Item as Returned</DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
                  <img
                    src={selectedBooking.item.images[0] || "/placeholder.svg?height=60&width=60"}
                    alt={selectedBooking.item.title}
                    className="w-15 h-15 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-100">{selectedBooking.item.title}</h3>
                    <p className="text-sm text-slate-400">Returned by: {selectedBooking.borrower.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Return Notes (Optional)</label>
                  <Textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Add any notes about the item condition..."
                    rows={3}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>

                {isOverdue(selectedBooking.endDate) && (
                  <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">
                        This item is {getDaysOverdue(selectedBooking.endDate)} days overdue
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={() => markAsReturned(selectedBooking.id, isOverdue(selectedBooking.endDate))}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Return
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReturnModal(false)}
                    className="border-slate-700 text-slate-300 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
