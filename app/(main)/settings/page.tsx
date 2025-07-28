"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { uploadImage } from "@/lib/supabase"
import { usersApi } from "@/lib/api"
import { User, Bell, Shield, LogOut, Camera, Save } from "lucide-react"

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    location: "",
    profileImage: "",
  })

  const [notifications, setNotifications] = useState({
    messages: true,
    bookings: true,
    returns: true,
    bids: true,
    matches: true,
    marketing: false,
  })

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showLocation: true,
    showRatings: true,
    allowMessages: true,
  })

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        location: (user.publicMetadata?.location as string) || "",
        profileImage: user.imageUrl || "",
      })
      setProfileImagePreview(user.imageUrl || "")
    }
  }, [user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      let imageUrl = profile.profileImage
      if (profileImage) {
        const uploadedUrl = await uploadImage(profileImage, "profiles")
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Update user profile via Clerk - FIXED: Use correct parameter names
      await user.update({
        firstName: profile.firstName,
        lastName: profile.lastName,
      })

      // Update user metadata
      await user.update({
        publicMetadata: {
          location: profile.location,
        },
      })

      // Update profile image if changed
      if (profileImage) {
        await user.setProfileImage({ file: profileImage })
      }

      // Update in our database
      await usersApi.update(user.id, {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        location: profile.location,
        profileImage: imageUrl,
      })

      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/sign-in")
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-100">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImagePreview || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">{profile.firstName[0] || "U"}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {`${profile.firstName} ${profile.lastName}`.trim()}
                </h3>
                <p className="text-slate-400">{user?.primaryEmailAddress?.emailAddress}</p>
                <p className="text-sm text-slate-500 mt-1">Click the camera icon to change your photo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-slate-200">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="text-slate-200">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location" className="text-slate-200">
                  Location
                </Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <Button onClick={saveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-100">
              <Bell className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">New Messages</h4>
                <p className="text-xs text-slate-400">Get notified when someone sends you a message</p>
              </div>
              <Switch
                checked={notifications.messages}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, messages: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Booking Updates</h4>
                <p className="text-xs text-slate-400">Get notified about booking confirmations and changes</p>
              </div>
              <Switch
                checked={notifications.bookings}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, bookings: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Return Reminders</h4>
                <p className="text-xs text-slate-400">Get reminded when items are due for return</p>
              </div>
              <Switch
                checked={notifications.returns}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, returns: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Bid Updates</h4>
                <p className="text-xs text-slate-400">Get notified about auction bids and wins</p>
              </div>
              <Switch
                checked={notifications.bids}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, bids: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Item Matches</h4>
                <p className="text-xs text-slate-400">Get notified when items matching your interests are listed</p>
              </div>
              <Switch
                checked={notifications.matches}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, matches: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Marketing Emails</h4>
                <p className="text-xs text-slate-400">Receive updates about new features and promotions</p>
              </div>
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-100">
              <Shield className="w-5 h-5 mr-2" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Public Profile</h4>
                <p className="text-xs text-slate-400">Allow others to view your profile</p>
              </div>
              <Switch
                checked={privacy.showProfile}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showProfile: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Show Location</h4>
                <p className="text-xs text-slate-400">Display your location on your profile</p>
              </div>
              <Switch
                checked={privacy.showLocation}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showLocation: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Show Ratings</h4>
                <p className="text-xs text-slate-400">Display your ratings and reviews publicly</p>
              </div>
              <Switch
                checked={privacy.showRatings}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showRatings: checked }))}
              />
            </div>

            <Separator className="bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Allow Messages</h4>
                <p className="text-xs text-slate-400">Allow other users to send you messages</p>
              </div>
              <Switch
                checked={privacy.allowMessages}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowMessages: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-slate-100">Sign Out</h4>
                <p className="text-xs text-slate-400">Sign out of your account on this device</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-700 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-red-400">Delete Account</h4>
                <p className="text-xs text-red-300">Permanently delete your account and all data</p>
              </div>
              <Button
                variant="outline"
                className="border-red-700 text-red-400 bg-transparent hover:bg-red-900/20"
                onClick={() => alert("Account deletion is not implemented in this demo")}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
