"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { itemsApi, inquiriesApi, bidsApi } from "@/lib/api"
import type { Item, Inquiry, Bid } from "@/lib/types"
import {
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  Flag,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { ItemCardSkeleton } from "@/components/ui/loading-skeleton"

export default function ListingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [item, setItem] = useState<Item | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newInquiry, setNewInquiry] = useState("")
  const [newBid, setNewBid] = useState("")
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadItemDetails()
    }
  }, [params.id])

  const loadItemDetails = async () => {
    try {
      setLoading(true)
      const [itemData, inquiriesData, bidsData] = await Promise.all([
        itemsApi.getById(params.id as string),
        inquiriesApi.getByItem(params.id as string),
        bidsApi.getByItem(params.id as string),
      ])

      setItem(itemData)
      setInquiries(inquiriesData)
      setBids(bidsData.sort((a, b) => b.amount - a.amount))
    } catch (error) {
      console.error("Failed to load item details:", error)
      router.push("/search")
    } finally {
      setLoading(false)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInquiry.trim() || !user || !item) return

    try {
      await inquiriesApi.create({
        itemId: item.id,
        askerId: user.id,
        question: newInquiry,
      })
      setNewInquiry("")
      loadItemDetails()
    } catch (error) {
      console.error("Failed to submit inquiry:", error)
    }
  }

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBid || !user || !item) return

    const bidAmount = Number.parseFloat(newBid)
    const highestBid = bids[0]?.amount || 0

    if (bidAmount <= highestBid) {
      alert("Bid must be higher than current highest bid")
      return
    }

    try {
      await bidsApi.create({
        itemId: item.id,
        bidderId: user.id,
        amount: bidAmount,
      })
      setNewBid("")
      loadItemDetails()
    } catch (error) {
      console.error("Failed to place bid:", error)
    }
  }

  const nextImage = () => {
    if (item && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item && item.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <ItemCardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ItemCardSkeleton />
              <ItemCardSkeleton />
            </div>
            <div className="space-y-4">
              <ItemCardSkeleton />
              <ItemCardSkeleton />
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!item) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Item not found</h1>
          <Button onClick={() => router.push("/search")}>Back to Search</Button>
        </div>
      </MainLayout>
    )
  }

  const isOwner = user?.id === item.ownerId
  const highestBid = bids[0]
  const isAuction = item.type === "SELL" && item.endDate && new Date(item.endDate) > new Date()

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-slate-100">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.images[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
                    alt={item.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />

                  {item.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  <div className="absolute top-4 right-4 flex space-x-2">
                    <Badge variant={item.type === "RENT" ? "default" : item.type === "SELL" ? "secondary" : "outline"}>
                      {item.type}
                    </Badge>
                    {isAuction && (
                      <Badge variant="destructive">
                        <Clock className="w-3 h-3 mr-1" />
                        Auction
                      </Badge>
                    )}
                  </div>

                  {/* Image indicators */}
                  {item.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {item.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-100 mb-2">{item.title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.location.address}
                        </span>
                        <span>{item.category}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {item.type === "GIVEAWAY" ? "Free" : `$${item.price}`}
                        {item.type === "RENT" && <span className="text-sm text-slate-400">/day</span>}
                      </div>
                      {isAuction && highestBid && (
                        <div className="text-sm text-slate-400">
                          Highest bid: <span className="text-green-400 font-semibold">${highestBid.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4 bg-slate-800" />

                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-3">Description</h3>
                    <p className="text-slate-300 leading-relaxed">{item.description}</p>
                  </div>

                  {item.type === "RENT" && (item.startDate || item.endDate) && (
                    <>
                      <Separator className="my-4 bg-slate-800" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-3">Availability</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-300">
                          {item.startDate && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              From: {new Date(item.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {item.endDate && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Until: {new Date(item.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bidding Section */}
            {isAuction && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Current Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  {bids.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No bids yet. Be the first to bid!</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {bids.slice(0, 5).map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={bid.bidder.profileImage || "/placeholder.svg"} />
                              <AvatarFallback>{bid.bidder.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-slate-100">{bid.bidder.name}</span>
                            {index === 0 && <Badge variant="default">Highest</Badge>}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">${bid.amount}</div>
                            <div className="text-xs text-slate-400">{new Date(bid.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isOwner && (
                    <form onSubmit={handleBidSubmit} className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min={highestBid ? highestBid.amount + 0.01 : 0.01}
                        value={newBid}
                        onChange={(e) => setNewBid(e.target.value)}
                        placeholder={`Min bid: $${highestBid ? (highestBid.amount + 0.01).toFixed(2) : "0.01"}`}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                        required
                      />
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Place Bid
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Q&A Section */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No questions yet. Ask the first question!</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="mb-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={inquiry.asker.profileImage || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">{inquiry.asker.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-100">{inquiry.asker.name}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-300">{inquiry.question}</p>
                        </div>
                        {inquiry.answer && (
                          <div className="ml-4 p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={item.owner.profileImage || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{item.owner.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-slate-100">{item.owner.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Owner
                              </Badge>
                            </div>
                            <p className="text-slate-300">{inquiry.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isOwner && (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <textarea
                      value={newInquiry}
                      onChange={(e) => setNewInquiry(e.target.value)}
                      placeholder="Ask a question about this item..."
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 resize-none"
                      required
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      Ask Question
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={item.owner.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>{item.owner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-100">{item.owner.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-slate-300">{item.owner.rating.toFixed(1)}</span>
                      <span className="text-xs text-slate-500">({item.owner.totalRatings} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link href={`/chat?user=${item.ownerId}&item=${item.id}`}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Owner
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full border-slate-700 text-slate-300 bg-transparent">
                    <Link href={`/profile/${item.ownerId}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!isOwner && (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {item.type === "RENT" && (
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/rentals?item=${item.id}`}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Link>
                      </Button>
                    )}

                    {item.type === "SELL" && !isAuction && (
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/chat?user=${item.ownerId}&item=${item.id}`}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Buy Now
                        </Link>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 bg-transparent"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-current text-red-400" : ""}`} />
                      {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report Listing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Item Stats */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-slate-100">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-slate-100">{item.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Listed:</span>
                    <span className="text-slate-100">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
