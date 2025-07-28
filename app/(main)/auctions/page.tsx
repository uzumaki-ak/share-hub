"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { itemsApi, bidsApi } from "@/lib/api"
import type { Item, Bid } from "@/lib/types"
import { Clock, Gavel, TrendingUp, Trophy, DollarSign } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"
import { ItemCardSkeleton } from "@/components/ui/loading-skeleton"

export default function AuctionsPage() {
  const { user } = useUser()
  const [auctions, setAuctions] = useState<Item[]>([])
  const [selectedAuction, setSelectedAuction] = useState<Item | null>(null)
  const [auctionBids, setAuctionBids] = useState<Bid[]>([])
  const [newBid, setNewBid] = useState("")
  const [loading, setLoading] = useState(true)
  const [bidLoading, setBidLoading] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)

  useEffect(() => {
    loadAuctions()
  }, [])

  const loadAuctions = async () => {
    try {
      setLoading(true)
      const items = await itemsApi.getAll()
      // Filter for auction items (items with end dates that haven't passed)
      const activeAuctions = items.filter(
        (item) => item.type === "SELL" && item.endDate && new Date(item.endDate) > new Date(),
      )
      setAuctions(activeAuctions)
    } catch (error) {
      console.error("Failed to load auctions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAuctionBids = async (itemId: string) => {
    try {
      const bids = await bidsApi.getByItem(itemId)
      setAuctionBids(bids.sort((a, b) => b.amount - a.amount))
    } catch (error) {
      console.error("Failed to load bids:", error)
    }
  }

  const openBidModal = async (auction: Item) => {
    setSelectedAuction(auction)
    await loadAuctionBids(auction.id)
    setShowBidModal(true)
  }

  const placeBid = async () => {
    if (!selectedAuction || !user || !newBid) return

    const bidAmount = Number.parseFloat(newBid)
    const highestBid = auctionBids[0]?.amount || selectedAuction.price

    if (bidAmount <= highestBid) {
      alert("Bid must be higher than current highest bid")
      return
    }

    try {
      setBidLoading(true)
      await bidsApi.create({
        itemId: selectedAuction.id,
        bidderId: user.id,
        amount: bidAmount,
      })

      setNewBid("")
      await loadAuctionBids(selectedAuction.id)
      loadAuctions() // Refresh auctions
    } catch (error) {
      console.error("Failed to place bid:", error)
      alert("Failed to place bid. Please try again.")
    } finally {
      setBidLoading(false)
    }
  }

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date().getTime()
    const end = new Date(endDate).getTime()
    const difference = end - now

    if (difference <= 0) return "Ended"

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getHighestBid = async (itemId: string) => {
    try {
      const bids = await bidsApi.getByItem(itemId)
      return bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0
    } catch {
      return 0
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-64"></div>
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
            <h1 className="text-3xl font-bold text-slate-100">Live Auctions</h1>
            <p className="text-slate-400 mt-1">Bid on items and win great deals</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-100">{auctions.length}</div>
              <div className="text-sm text-slate-400">Active Auctions</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Gavel className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400 mb-1">{auctions.length}</div>
              <div className="text-sm text-slate-400">Live Auctions</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {
                  auctions.filter((a) => {
                    const timeLeft = new Date(a.endDate!).getTime() - new Date().getTime()
                    return timeLeft <= 24 * 60 * 60 * 1000 // 24 hours
                  }).length
                }
              </div>
              <div className="text-sm text-slate-400">Ending Soon</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400 mb-1">
                {auctions.filter((a) => a.category === "Electronics").length}
              </div>
              <div className="text-sm text-slate-400">Electronics</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-400 mb-1">0</div>
              <div className="text-sm text-slate-400">Won Auctions</div>
            </CardContent>
          </Card>
        </div>

        {/* Auctions Grid */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Active Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            {auctions.length === 0 ? (
              <EmptyState
                icon={Gavel}
                title="No active auctions"
                description="Check back later for new auction listings"
                action={{
                  label: "Browse All Items",
                  href: "/search",
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <Card
                    key={auction.id}
                    className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors group"
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={auction.images[0] || "/placeholder.svg?height=200&width=300"}
                          alt={auction.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <Badge className="bg-purple-600 text-white">
                            <Gavel className="w-3 h-3 mr-1" />
                            Auction
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {getTimeRemaining(auction.endDate!)}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-100 truncate">{auction.title}</h3>
                        </div>

                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{auction.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Starting bid:</span>
                            <span className="text-slate-100">${auction.price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Current bid:</span>
                            <span className="text-green-400 font-semibold">
                              ${auction.price} {/* This would be replaced with actual highest bid */}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Ends:</span>
                            <span className="text-slate-100">{new Date(auction.endDate!).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openBidModal(auction)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            Place Bid
                          </Button>
                          <Button asChild variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                            <Link href={`/listings/${auction.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid Modal */}
        <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Place Your Bid</DialogTitle>
            </DialogHeader>

            {selectedAuction && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
                  <img
                    src={selectedAuction.images[0] || "/placeholder.svg?height=80&width=80"}
                    alt={selectedAuction.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{selectedAuction.title}</h3>
                    <p className="text-sm text-slate-400">{selectedAuction.category}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-slate-400">
                        Time left: <span className="text-orange-400">{getTimeRemaining(selectedAuction.endDate!)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Bids */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-100 mb-3">Current Bids</h4>
                  {auctionBids.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No bids yet. Be the first to bid!</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {auctionBids.slice(0, 5).map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">
                            {bid.bidder.name} {index === 0 && <Badge className="ml-2 bg-green-600">Highest</Badge>}
                          </span>
                          <span className="font-semibold text-green-400">${bid.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bid Form */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-200">Your Bid Amount</Label>
                    <div className="flex space-x-2 mt-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="number"
                          step="0.01"
                          min={auctionBids[0] ? auctionBids[0].amount + 0.01 : selectedAuction.price + 0.01}
                          value={newBid}
                          onChange={(e) => setNewBid(e.target.value)}
                          placeholder={`Min: $${auctionBids[0] ? (auctionBids[0].amount + 0.01).toFixed(2) : (selectedAuction.price + 0.01).toFixed(2)}`}
                          className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                        />
                      </div>
                      <Button
                        onClick={placeBid}
                        disabled={!newBid || bidLoading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {bidLoading ? "Placing..." : "Place Bid"}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    * You'll be notified if you're outbid. Winning bidders will be contacted after the auction ends.
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowBidModal(false)}
                    className="flex-1 border-slate-700 text-slate-300 bg-transparent"
                  >
                    Close
                  </Button>
                  <Button asChild variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                    <Link href={`/listings/${selectedAuction.id}`}>View Details</Link>
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
