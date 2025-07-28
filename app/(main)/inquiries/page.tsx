"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { inquiriesApi, itemsApi } from "@/lib/api"
import type { Inquiry, Item } from "@/lib/types"
import { HelpCircle, MessageCircle, Clock, CheckCircle, Send } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"

export default function InquiriesPage() {
  const { user } = useUser()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [userItems, setUserItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"received" | "sent">("received")
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (user) {
      loadInquiries()
    }
  }, [user])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      // Get user's items to find inquiries about them
      const items = await itemsApi.getUserItems(user!.id)
      setUserItems(items)

      // Get all inquiries for user's items
      const allInquiries: Inquiry[] = []
      for (const item of items) {
        const itemInquiries = await inquiriesApi.getByItem(item.id)
        allInquiries.push(...itemInquiries)
      }

      setInquiries(allInquiries)
    } catch (error) {
      console.error("Failed to load inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (inquiryId: string) => {
    const answer = answers[inquiryId]
    if (!answer?.trim()) return

    try {
      await inquiriesApi.answer(inquiryId, answer)
      setAnswers((prev) => ({ ...prev, [inquiryId]: "" }))
      loadInquiries()
    } catch (error) {
      console.error("Failed to submit answer:", error)
    }
  }

  const receivedInquiries = inquiries.filter((inquiry) => userItems.some((item) => item.id === inquiry.itemId))

  const sentInquiries = inquiries.filter((inquiry) => inquiry.askerId === user?.id)

  const displayInquiries = filter === "received" ? receivedInquiries : sentInquiries
  const unansweredCount = receivedInquiries.filter((inquiry) => !inquiry.answer).length

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-64"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-slate-900 rounded-lg p-4">
                <div className="animate-pulse flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
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
            <h1 className="text-3xl font-bold text-slate-100">Q&A Center</h1>
            <p className="text-slate-400 mt-1">Manage questions about your listings</p>
          </div>
          <div className="flex items-center space-x-4">
            {unansweredCount > 0 && (
              <Badge variant="destructive" className="bg-red-600">
                {unansweredCount} unanswered
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-blue-400 mb-1">{receivedInquiries.length}</div>
              <div className="text-sm text-slate-400">Total Received</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400 mb-1">{unansweredCount}</div>
              <div className="text-sm text-slate-400">Unanswered</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-green-400 mb-1">
                {receivedInquiries.filter((i) => i.answer).length}
              </div>
              <div className="text-sm text-slate-400">Answered</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-purple-400 mb-1">{sentInquiries.length}</div>
              <div className="text-sm text-slate-400">Sent by You</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={filter === "received" ? "default" : "outline"}
            onClick={() => setFilter("received")}
            className={filter === "received" ? "bg-blue-600" : "border-slate-700 text-slate-300 bg-transparent"}
          >
            Received ({receivedInquiries.length})
          </Button>
          <Button
            variant={filter === "sent" ? "default" : "outline"}
            onClick={() => setFilter("sent")}
            className={filter === "sent" ? "bg-blue-600" : "border-slate-700 text-slate-300 bg-transparent"}
          >
            Sent ({sentInquiries.length})
          </Button>
        </div>

        {/* Inquiries List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">
              {filter === "received" ? "Questions About Your Items" : "Your Questions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayInquiries.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title={filter === "received" ? "No questions received" : "No questions sent"}
                description={
                  filter === "received"
                    ? "Questions about your listings will appear here"
                    : "Questions you ask about items will appear here"
                }
                action={
                  filter === "sent"
                    ? {
                        label: "Browse Items",
                        href: "/search",
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-6">
                {displayInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="border-l-4 border-blue-500 pl-6 pb-6 border-b border-slate-800 last:border-b-0"
                  >
                    {/* Item Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={inquiry.item.images[0] || "/placeholder.svg?height=50&width=50"}
                        alt={inquiry.item.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <Link
                          href={`/listings/${inquiry.item.id}`}
                          className="font-semibold text-slate-100 hover:text-blue-400"
                        >
                          {inquiry.item.title}
                        </Link>
                        <p className="text-sm text-slate-400">{inquiry.item.category}</p>
                      </div>
                      {!inquiry.answer && filter === "received" && (
                        <Badge className="bg-orange-600 text-white">
                          <Clock className="w-3 h-3 mr-1" />
                          Needs Answer
                        </Badge>
                      )}
                    </div>

                    {/* Question */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={inquiry.asker.profileImage || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{inquiry.asker.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-slate-100">{inquiry.asker.name}</span>
                        <span className="text-xs text-slate-500">
                          asked {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-slate-300">{inquiry.question}</p>
                      </div>
                    </div>

                    {/* Answer */}
                    {inquiry.answer ? (
                      <div className="ml-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={inquiry.item.owner.profileImage || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{inquiry.item.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-100">{inquiry.item.owner.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Owner
                          </Badge>
                          <span className="text-xs text-slate-500">
                            answered {new Date(inquiry.answeredAt!).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                          <p className="text-slate-300">{inquiry.answer}</p>
                        </div>
                      </div>
                    ) : (
                      filter === "received" && (
                        <div className="ml-4">
                          <div className="space-y-3">
                            <Textarea
                              value={answers[inquiry.id] || ""}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [inquiry.id]: e.target.value }))}
                              placeholder="Type your answer..."
                              rows={3}
                              className="bg-slate-800 border-slate-700 text-slate-100"
                            />
                            <Button
                              onClick={() => submitAnswer(inquiry.id)}
                              disabled={!answers[inquiry.id]?.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Answer
                            </Button>
                          </div>
                        </div>
                      )
                    )}

                    {filter === "sent" && !inquiry.answer && (
                      <div className="ml-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                        <p className="text-yellow-400 text-sm">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Waiting for owner's response
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
