"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { usersApi, itemsApi, ratingsApi } from "@/lib/api"
import type { User, Item, Rating } from "@/lib/types"
import { Star, MapPin, Calendar, Award, MessageCircle, Flag, Package } from "lucide-react"
import Link from "next/link"
import { ProfileSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [userItems, setUserItems] = useState<Item[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [showRatingForm, setShowRatingForm] = useState(false)

  useEffect(() => {
    if (params.userId) {
      loadProfile()
    }
  }, [params.userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const [userData, itemsData, ratingsData] = await Promise.all([
        usersApi.getById(params.userId as string),
        itemsApi.getUserItems(params.userId as string),
        usersApi.getRatings(params.userId as string),
      ])

      setProfile(userData)
      setUserItems(itemsData)
      setRatings(ratingsData)
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitRating = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !profile || newRating === 0) return

    try {
      await ratingsApi.create({
        raterId: currentUser.id,
        ratedUserId: profile.id,
        rating: newRating,
        comment: newComment.trim() || undefined,
      })

      setNewRating(0)
      setNewComment("")
      setShowRatingForm(false)
      loadProfile() // Refresh data
    } catch (error) {
      console.error("Failed to submit rating:", error)
    }
  }

  const getBadges = (user: User) => {
    const badges = []
    if (user.rating >= 4.5) badges.push({ name: "Excellent Host", color: "bg-yellow-500" })
    if (user.totalRatings >= 50) badges.push({ name: "Experienced", color: "bg-blue-500" })
    if (userItems.length >= 10) badges.push({ name: "Active Sharer", color: "bg-green-500" })
    return badges
  }

  if (loading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    )
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Profile not found</h1>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </MainLayout>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id
  const badges = getBadges(profile)

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Profile Header */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">{profile.name}</h1>
                    <div className="flex items-center space-x-4 text-slate-400 mb-2">
                      {profile.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {profile.location}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Joined {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= profile.rating ? "text-yellow-400 fill-current" : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-100 font-semibold">{profile.rating.toFixed(1)}</span>
                      <span className="text-slate-400">({profile.totalRatings} reviews)</span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex space-x-2">
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={`/chat?user=${profile.id}`}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="border-slate-700 text-slate-300 bg-transparent"
                        onClick={() => setShowRatingForm(true)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Rate User
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                      <Badge key={index} className={`${badge.color} text-white`}>
                        <Award className="w-3 h-3 mr-1" />
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{userItems.length}</div>
              <div className="text-sm text-slate-400">Items Listed</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {userItems.filter((item) => item.type === "RENT").length}
              </div>
              <div className="text-sm text-slate-400">For Rent</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {userItems.filter((item) => item.type === "SELL").length}
              </div>
              <div className="text-sm text-slate-400">For Sale</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {userItems.filter((item) => item.type === "GIVEAWAY").length}
              </div>
              <div className="text-sm text-slate-400">Free Items</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User's Items */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  {isOwnProfile ? "Your Listings" : `${profile.name}'s Listings`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userItems.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No listings yet"
                    description={
                      isOwnProfile
                        ? "Create your first listing to get started"
                        : "This user hasn't listed any items yet"
                    }
                    action={
                      isOwnProfile
                        ? {
                            label: "Create Listing",
                            href: "/listings/new",
                          }
                        : undefined
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userItems.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={item.images[0] || "/placeholder.svg?height=150&width=250"}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                            <Badge
                              className="absolute top-2 right-2"
                              variant={
                                item.type === "RENT" ? "default" : item.type === "SELL" ? "secondary" : "outline"
                              }
                            >
                              {item.type}
                            </Badge>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold text-slate-100 mb-1 truncate">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-2 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-400">
                                {item.type === "GIVEAWAY" ? "Free" : `$${item.price}`}
                              </span>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300 bg-transparent"
                              >
                                <Link href={`/listings/${item.id}`}>View</Link>
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
          </div>

          {/* Reviews & Rating Form */}
          <div className="space-y-6">
            {/* Rating Form */}
            {!isOwnProfile && showRatingForm && (
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Rate {profile.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitRating} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Rating</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className={`w-8 h-8 ${
                              star <= newRating
                                ? "text-yellow-400 fill-current"
                                : "text-slate-600 hover:text-yellow-400"
                            }`}
                          >
                            <Star className="w-full h-full" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Comment (Optional)</label>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience..."
                        rows={3}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={newRating === 0} className="bg-blue-600 hover:bg-blue-700">
                        Submit Rating
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowRatingForm(false)}
                        className="border-slate-700 text-slate-300 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Reviews ({ratings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <EmptyState
                    icon={Star}
                    title="No reviews yet"
                    description={
                      isOwnProfile ? "Reviews from other users will appear here" : "Be the first to leave a review"
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {ratings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className="border-b border-slate-800 pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={rating.rater.profileImage || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{rating.rater.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-slate-100">{rating.rater.name}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= rating.rating ? "text-yellow-400 fill-current" : "text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(rating.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {rating.comment && <p className="text-sm text-slate-300">{rating.comment}</p>}
                          </div>
                        </div>
                      </div>
                    ))}

                    {ratings.length > 5 && (
                      <Button variant="outline" className="w-full border-slate-700 text-slate-300 bg-transparent">
                        View All Reviews
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
