"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadImage } from "@/lib/supabase"
import { itemsApi } from "@/lib/api"
import { Upload, X, MapPin } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import map component to avoid SSR issues
const MapSelector = dynamic(() => import("@/components/map/map-selector"), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />,
})

const categories = [
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

export default function CreateListingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    type: "RENT" as "RENT" | "SELL" | "GIVEAWAY",
    startDate: "",
    endDate: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      alert("Maximum 5 images allowed")
      return
    }

    setImages((prev) => [...prev, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !location) return

    setLoading(true)
    try {
      // Upload images
      const imageUrls = await Promise.all(images.map((image) => uploadImage(image)))
      const validImageUrls = imageUrls.filter((url) => url !== null) as string[]

      // Create listing
      await itemsApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        type: formData.type,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        images: validImageUrls,
        location,
        ownerId: user.id,
        available: true,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create listing:", error)
      alert("Failed to create listing. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Create New Listing</h1>
          <p className="text-slate-400 mt-1">Share your items with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-slate-200">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="What are you sharing?"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-200">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-slate-200">
                    Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-slate-100">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type" className="text-slate-200">
                    Type *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "RENT" | "SELL" | "GIVEAWAY") =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectValue />
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
                </div>
              </div>

              <div>
                <Label htmlFor="price" className="text-slate-200">
                  Price {formData.type === "GIVEAWAY" ? "(Optional)" : "*"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder={formData.type === "RENT" ? "Price per day" : "Price"}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  required={formData.type !== "GIVEAWAY"}
                />
              </div>

              {formData.type === "RENT" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate" className="text-slate-200">
                      Available From
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-slate-200">
                      Available Until
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Images (Max 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "./book.jpg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-100">
                <MapPin className="w-5 h-5 mr-2" />
                Location *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MapSelector onLocationSelect={setLocation} />
                {location && (
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-300">Selected location:</p>
                    <p className="text-slate-100">{location.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !location} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
