"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCardSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { itemsApi } from "@/lib/api"
import type { Item, SearchFilters } from "@/lib/types"
import { Search, Filter, MapPin, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

const categories = [
  "All",
  "Electronics",
  "Tools",
  "Sports",
  "Books",
  "Furniture",
  "Clothing",
  "Vehicles",
  "Garden",
  "Kitchen",
  "Other",
]

export default function SearchPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    category: "",
    radius: 10,
    minPrice: undefined,
    maxPrice: undefined,
    type: undefined,
  })

  useEffect(() => {
    searchItems()
  }, [])

  const searchItems = async () => {
    try {
      setLoading(true)
      const results = await itemsApi.search(filters)
      setItems(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchItems()
  }

  const calculateDistance = (item: Item) => {
    // Mock distance calculation - in real app, use user's location
    return Math.floor(Math.random() * 20) + 1
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
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
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Search Items</h1>
          <p className="text-slate-400 mt-1">Discover amazing items in your community</p>
        </div>

        {/* Search Filters */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search items..."
                    value={filters.keyword}
                    onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>

                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value === "All" ? "" : value }))}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-slate-100">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value: "RENT" | "SELL" | "GIVEAWAY" | undefined) =>
                    setFilters((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="RENT" className="text-slate-100">
                      Rent
                    </SelectItem>
                    <SelectItem value="SELL" className="text-slate-100">
                      Sell
                    </SelectItem>
                    <SelectItem value="GIVEAWAY" className="text-slate-100">
                      Give Away
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-slate-300">Radius: {filters.radius}km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.radius}
                    onChange={(e) => setFilters((prev) => ({ ...prev, radius: Number.parseInt(e.target.value) }))}
                    className="w-32"
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-100">{items.length} items found</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
              <Link href="/map">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-transparent">
                  <MapPin className="w-4 h-4 mr-2" />
                  Map View
                </Button>
              </Link>
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No items found"
              description="Try adjusting your search filters or browse all categories"
              action={{
                label: "Clear Filters",
                onClick: () => {
                  setFilters({
                    keyword: "",
                    category: "",
                    radius: 10,
                    minPrice: undefined,
                    maxPrice: undefined,
                    type: undefined,
                  })
                  searchItems()
                },
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={item.images[0] || "/book.jpg"}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Badge
                          variant={item.type === "RENT" ? "default" : item.type === "SELL" ? "secondary" : "outline"}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <button className="absolute top-2 left-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-100 truncate">{item.title}</h3>
                        <span className="text-lg font-bold text-blue-400 ml-2">
                          {item.type === "GIVEAWAY" ? "Free" : `$${item.price}`}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {calculateDistance(item)}km away
                        </span>
                        <span>{item.category}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Button asChild size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Link href={`/listings/${item.id}`}>View Details</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
