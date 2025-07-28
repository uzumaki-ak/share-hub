"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { bookingsApi, itemsApi } from "@/lib/api"
import type { Booking, Item } from "@/lib/types"
import { Clock, Package, CheckCircle, XCircle } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ItemCardSkeleton } from "@/components/ui/loading-skeleton"

export default function RentalsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  useEffect(() => {
    const itemId = searchParams.get("item")
    if (itemId) {
      loadItemForBooking(itemId)
    }
  }, [searchParams])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await bookingsApi.getUserBookings(user!.id)
      setBookings(bookingsData)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadItemForBooking = async (itemId: string) => {
    try {
      const item = await itemsApi.getById(itemId)
      setSelectedItem(item)
      setShowBookingModal(true)
    } catch (error) {
      console.error("Failed to load item:", error)
    }
  }

  const calculateCost = () => {
    if (!selectedDates.from || !selectedDates.to || !selectedItem) return 0

    const days = Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24))
    return days * selectedItem.price
  }

  const handleBooking = async () => {
    if (!selectedDates.from || !selectedDates.to || !selectedItem || !user) return

    try {
      setBookingLoading(true)
      await bookingsApi.create({
        itemId: selectedItem.id,
        borrowerId: user.id,
        startDate: selectedDates.from,
        endDate: selectedDates.to,
        totalCost: calculateCost(),
      })

      setShowBookingModal(false)
      setSelectedDates({ from: undefined, to: undefined })
      setSelectedItem(null)
      loadBookings()
    } catch (error) {
      console.error("Failed to create booking:", error)
      alert("Failed to create booking. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "ACTIVE":
        return "bg-green-500"
      case "COMPLETED":
        return "bg-blue-500"
      case "CANCELLED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
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
            <h1 className="text-3xl font-bold text-slate-100">My Rentals</h1>
            <p className="text-slate-400 mt-1">Manage your rental bookings and history</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-100">{bookings.length}</div>
              <div className="text-sm text-slate-400">Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {bookings.filter((b) => b.status === "PENDING").length}
              </div>
              <div className="text-sm text-slate-400">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {bookings.filter((b) => b.status === "ACTIVE").length}
              </div>
              <div className="text-sm text-slate-400">Active</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {bookings.filter((b) => b.status === "COMPLETED").length}
              </div>
              <div className="text-sm text-slate-400">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-100 mb-1">
                ${bookings.reduce((sum, b) => sum + b.totalCost, 0).toFixed(2)}
              </div>
              <div className="text-sm text-slate-400">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No bookings yet"
                description="Start renting items from the community to see your bookings here"
                action={{
                  label: "Browse Items",
                  href: "/search",
                }}
              />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.item.images[0] || "/placeholder.svg?height=80&width=80"}
                        alt={booking.item.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-100">{booking.item.title}</h3>
                            <p className="text-sm text-slate-400">{booking.item.category}</p>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-white`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Rental Period:</span>
                            <div className="text-slate-100">
                              {new Date(booking.startDate).toLocaleDateString()} -{" "}
                              {new Date(booking.endDate).toLocaleDateString()}
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400">Total Cost:</span>
                            <div className="text-slate-100 font-semibold">${booking.totalCost.toFixed(2)}</div>
                          </div>

                          <div>
                            <span className="text-slate-400">Booked:</span>
                            <div className="text-slate-100">{new Date(booking.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-3">
                          {booking.status === "ACTIVE" && !booking.returned && (
                            <Button
                              size="sm"
                              onClick={() => bookingsApi.markReturned(booking.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark as Returned
                            </Button>
                          )}

                          {booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => bookingsApi.update(booking.id, { status: "CANCELLED" })}
                              className="border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
                            >
                              Cancel Booking
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-300 bg-transparent"
                          >
                            View Details
                          </Button>
                        </div>

                        {booking.isLate && (
                          <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
                            ⚠️ This item is overdue. Please return it as soon as possible.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle>Book {selectedItem?.title}</DialogTitle>
            </DialogHeader>

            {selectedItem && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedItem.images[0] || "/placeholder.svg?height=60&width=60"}
                    alt={selectedItem.title}
                    className="w-15 h-15 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-100">{selectedItem.title}</h3>
                    <p className="text-sm text-slate-400">${selectedItem.price}/day</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-200">Select rental dates</Label>
                  <Calendar
                    mode="range"
                    selected={selectedDates}
                    onSelect={setSelectedDates}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border border-slate-700 bg-slate-800"
                  />
                </div>

                {selectedDates.from && selectedDates.to && (
                  <div className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Rental period:</span>
                      <span className="text-slate-100">
                        {Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24))}{" "}
                        days
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Daily rate:</span>
                      <span className="text-slate-100">${selectedItem.price}</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-100">Total cost:</span>
                      <span className="text-green-400">${calculateCost().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDates.from || !selectedDates.to || bookingLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {bookingLoading ? "Booking..." : "Confirm Booking"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
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
