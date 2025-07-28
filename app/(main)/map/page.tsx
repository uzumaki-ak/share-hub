"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { itemsApi } from "@/lib/api"
import type { Item } from "@/lib/types"
import dynamic from "next/dynamic"
import Link from "next/link"

// Dynamically import map component to avoid SSR issues
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-slate-400">Loading map...</div>
    </div>
  ),
})

export default function MapPage() {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const allItems = await itemsApi.getAll()
      setItems(allItems)
    } catch (error) {
      console.error("Failed to load items:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Map View</h1>
            <p className="text-slate-400 mt-1">Explore items near you</p>
          </div>
          <div className="flex space-x-2">
            <Link href="/search">
              <Button variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                List View
              </Button>
            </Link>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 flex space-x-4">
          {/* Map */}
          <div className="flex-1 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <MapView items={items} onItemSelect={setSelectedItem} loading={loading} />
          </div>

          {/* Item Details Sidebar */}
          <div className="w-80 space-y-4">
            {selectedItem ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-0">
                  <img
                    src={selectedItem.images[0] || "/placeholder.svg?height=200&width=320"}
                    alt={selectedItem.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-100">{selectedItem.title}</h3>
                      <Badge
                        variant={
                          selectedItem.type === "RENT"
                            ? "default"
                            : selectedItem.type === "SELL"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {selectedItem.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-400 mb-3">{selectedItem.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-blue-400">
                        {selectedItem.type === "GIVEAWAY" ? "Free" : `$${selectedItem.price}`}
                      </span>
                      <span className="text-sm text-slate-500">{selectedItem.category}</span>
                    </div>

                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link href={`/listings/${selectedItem.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="text-slate-400">
                    <div className="w-12 h-12 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-100 mb-2">Select an item</h3>
                    <p className="text-sm">Click on a pin to see item details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Map Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Items:</span>
                    <span className="text-slate-100">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">For Rent:</span>
                    <span className="text-slate-100">{items.filter((i) => i.type === "RENT").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">For Sale:</span>
                    <span className="text-slate-100">{items.filter((i) => i.type === "SELL").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Free:</span>
                    <span className="text-slate-100">{items.filter((i) => i.type === "GIVEAWAY").length}</span>
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
