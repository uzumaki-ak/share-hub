"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadImage } from "@/lib/supabase"
import { Shield, AlertTriangle, CheckCircle, Users, MapPin, Clock, Flag, Phone, Mail } from "lucide-react"

const safetyTips = [
  {
    icon: <Users className="w-6 h-6 text-blue-400" />,
    title: "Meet in Public Places",
    description:
      "Always meet in well-lit, public locations with good foot traffic. Avoid isolated areas or private residences for initial meetings.",
  },
  {
    icon: <Clock className="w-6 h-6 text-green-400" />,
    title: "Meet During Daylight",
    description:
      "Schedule meetings during daylight hours when possible. If you must meet at night, choose well-lit areas with security cameras.",
  },
  {
    icon: <Users className="w-6 h-6 text-purple-400" />,
    title: "Bring a Friend",
    description:
      "Consider bringing a trusted friend or family member, especially for high-value items or first-time meetings.",
  },
  {
    icon: <Phone className="w-6 h-6 text-orange-400" />,
    title: "Verify Identity",
    description:
      "Verify the person's identity through the app's messaging system and check their profile ratings before meeting.",
  },
  {
    icon: <MapPin className="w-6 h-6 text-red-400" />,
    title: "Share Your Location",
    description:
      "Let someone know where you're going and when you expect to return. Share your live location if possible.",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-teal-400" />,
    title: "Trust Your Instincts",
    description:
      "If something feels wrong or unsafe, trust your instincts and leave immediately. Your safety is more important than any transaction.",
  },
]

const meetupChecklist = [
  "Verify the person's identity through their profile",
  "Choose a public meeting location",
  "Meet during daylight hours",
  "Bring a friend if possible",
  "Inspect the item thoroughly before payment",
  "Use secure payment methods",
  "Keep records of the transaction",
  "Report any suspicious behavior",
]

const reportReasons = [
  "Fraudulent listing",
  "Inappropriate content",
  "Harassment or abuse",
  "Spam or scam",
  "Safety concerns",
  "Counterfeit items",
  "Other",
]

export default function SafetyPage() {
  const { user } = useUser()
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
    screenshot: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReportForm((prev) => ({ ...prev, screenshot: file }))
    }
  }

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.reason || !user) return

    try {
      setSubmitting(true)

      let screenshotUrl = null
      if (reportForm.screenshot) {
        screenshotUrl = await uploadImage(reportForm.screenshot, "reports")
      }

      // In a real app, this would call an API to submit the report
      console.log("Report submitted:", {
        reporterId: user.id,
        reason: reportForm.reason,
        description: reportForm.description,
        screenshot: screenshotUrl,
      })

      alert("Report submitted successfully. We'll review it within 24 hours.")
      setReportForm({ reason: "", description: "", screenshot: null })
      setShowReportModal(false)
    } catch (error) {
      console.error("Failed to submit report:", error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Safety Center</h1>
          <p className="text-slate-400">Your safety is our top priority. Learn how to stay safe while sharing.</p>
        </div>

        {/* Emergency Contact */}
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-400">Emergency?</h3>
                <p className="text-sm text-red-300">
                  If you're in immediate danger, call emergency services (100) first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Safety Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{tip.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-100 mb-2">{tip.title}</h3>
                    <p className="text-sm text-slate-400">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meetup Checklist */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Pre-Meetup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetupChecklist.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Section */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Report Safety Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Flag className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Encountered a Problem?</h3>
              <p className="text-slate-400 mb-4">
                Help us keep the community safe by reporting suspicious activity, fraudulent listings, or safety
                concerns.
              </p>

              <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle>Report Safety Concern</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={submitReport} className="space-y-4">
                    <div>
                      <Label htmlFor="reason" className="text-slate-200">
                        Reason for Report *
                      </Label>
                      <Select
                        value={reportForm.reason}
                        onValueChange={(value) => setReportForm((prev) => ({ ...prev, reason: value }))}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {reportReasons.map((reason) => (
                            <SelectItem key={reason} value={reason} className="text-slate-100">
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-slate-200">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={reportForm.description}
                        onChange={(e) => setReportForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Please provide details about the issue..."
                        rows={4}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="screenshot" className="text-slate-200">
                        Screenshot (Optional)
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="screenshot"
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                        />
                        {reportForm.screenshot && (
                          <p className="text-sm text-green-400 mt-1">
                            Screenshot selected: {reportForm.screenshot.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={!reportForm.reason || submitting}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {submitting ? "Submitting..." : "Submit Report"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReportModal(false)}
                        className="border-slate-700 text-slate-300 bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <Mail className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <h3 className="font-semibold text-slate-100 mb-1">Email Support</h3>
                <p className="text-sm text-slate-400 mb-3">Get help via email</p>
                <Button variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                  safety@sharespace.com
                </Button>
              </div>

              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <Phone className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="font-semibold text-slate-100 mb-1">Safety Hotline</h3>
                <p className="text-sm text-slate-400 mb-3">24/7 safety support</p>
                <Button variant="outline" className="border-slate-700 text-slate-300 bg-transparent">
                  1-800-SAFE-123
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
