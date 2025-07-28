"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
}

export default function MapSelector({ onLocationSelect, initialLocation }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView(
      initialLocation ? [initialLocation.lat, initialLocation.lng] : [40.7128, -74.006], // Default to NYC
      13,
    )

    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Add click handler
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map)
      markerRef.current = marker

      // Reverse geocoding to get address
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        onLocationSelect({ lat, lng, address })
        marker.bindPopup(address).openPopup()
      } catch (error) {
        console.error("Geocoding error:", error)
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        onLocationSelect({ lat, lng, address })
        marker.bindPopup(address).openPopup()
      }
    })

    // Get user's current location
    if (navigator.geolocation && !initialLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 13)
          setLoading(false)
        },
        () => {
          setLoading(false)
        },
      )
    } else {
      setLoading(false)
    }

    return () => {
      map.remove()
    }
  }, [onLocationSelect, initialLocation])

  return (
    <div className="relative">
      <div ref={mapRef} className="h-64 w-full rounded-lg border border-slate-700" style={{ minHeight: "256px" }} />
      {loading && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-slate-400">Loading map...</div>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-2">Click on the map to select a location</p>
    </div>
  )
}
