"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Item } from "@/lib/types"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapViewProps {
  items: Item[]
  onItemSelect: (item: Item) => void
  loading: boolean
}

export default function MapView({ items, onItemSelect, loading }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.006], 12) // Default to NYC
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 13)
        },
        (error) => {
          console.log("Geolocation error:", error)
        },
      )
    }

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || loading) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current!.removeLayer(marker)
    })
    markersRef.current = []

    // Add markers for items
    items.forEach((item) => {
      if (!item.location) return

      // Create custom icon based on item type
      const iconColor = item.type === "RENT" ? "blue" : item.type === "SELL" ? "green" : "orange"

      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${iconColor === "blue" ? "#3b82f6" : iconColor === "green" ? "#10b981" : "#f59e0b"};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${item.type === "RENT" ? "R" : item.type === "SELL" ? "S" : "F"}
          </div>
        `,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker([item.location.lat, item.location.lng], { icon: customIcon }).addTo(
        mapInstanceRef.current!,
      )

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <img src="${item.images[0] || "/placeholder.svg?height=100&width=200"}" 
               alt="${item.title}" 
               style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #1e293b;">
            ${item.title}
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.4;">
            ${item.description.substring(0, 100)}${item.description.length > 100 ? "..." : ""}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #3b82f6;">
              ${item.type === "GIVEAWAY" ? "Free" : `$${item.price}`}
            </span>
            <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 12px;">
              ${item.type}
            </span>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Add click handler
      marker.on("click", () => {
        onItemSelect(item)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [items, loading, onItemSelect])

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center">
          <div className="text-slate-300">Loading items...</div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-semibold mb-2 text-slate-800">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-slate-700">Rent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-slate-700">Sell</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-slate-700">Free</span>
          </div>
        </div>
      </div>
    </div>
  )
}
