"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { messagesApi } from "@/lib/api"
import type { Message, User } from "@/lib/types"
import { Send, Search, MoreVertical, Flag, UserX } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

interface Conversation {
  user: User
  lastMessage: Message
  unreadCount: number
}

export default function ChatPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  useEffect(() => {
    const targetUser = searchParams.get("user")
    if (targetUser && conversations.length > 0) {
      setActiveConversation(targetUser)
      loadMessages(user!.id, targetUser)
    }
  }, [searchParams, conversations, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const conversationsData = await messagesApi.getConversations(user!.id)

      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>()

      conversationsData.forEach((message) => {
        const partnerId = message.senderId === user!.id ? message.receiverId : message.senderId
        const partner = message.senderId === user!.id ? message.receiver : message.sender

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: message,
            unreadCount: 0,
          })
        }

        const conversation = conversationMap.get(partnerId)!
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message
        }

        if (!message.read && message.receiverId === user!.id) {
          conversation.unreadCount++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId1: string, userId2: string) => {
    try {
      const messagesData = await messagesApi.getMessages(userId1, userId2)
      setMessages(messagesData)

      // Mark messages as read
      const unreadMessages = messagesData.filter((m) => !m.read && m.receiverId === user!.id)
      await Promise.all(unreadMessages.map((m) => messagesApi.markRead(m.id)))
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || !user) return

    try {
      const message = await messagesApi.send({
        senderId: user.id,
        receiverId: activeConversation,
        content: newMessage,
        itemId: searchParams.get("item") || undefined,
      })

      setMessages((prev) => [...prev, message])
      setNewMessage("")
      loadConversations() // Refresh conversations
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeUser = conversations.find((c) => c.user.id === activeConversation)?.user

  if (loading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-8rem)] flex">
          <div className="w-80 bg-slate-900 border-r border-slate-800 p-4">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-slate-950 flex items-center justify-center">
            <div className="text-slate-400">Loading messages...</div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex animate-fade-in">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Send}
                  title="No conversations"
                  description="Start chatting with item owners to see conversations here"
                />
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => {
                      setActiveConversation(conversation.user.id)
                      loadMessages(user!.id, conversation.user.id)
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      activeConversation === conversation.user.id ? "bg-blue-600" : "hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.user.profileImage || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 flex items-center justify-center">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-slate-100 truncate">{conversation.user.name}</h3>
                          <span className="text-xs text-slate-400">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {conversation.lastMessage.senderId === user!.id ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {activeConversation && activeUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activeUser.profileImage || "/placeholder.svg"} />
                      <AvatarFallback>{activeUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-100">{activeUser.name}</h3>
                      <p className="text-sm text-slate-400">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
                      <Flag className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
                      <UserX className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                        <Send className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-100 mb-2">Start the conversation</h3>
                      <p className="text-slate-400">Send a message to get started</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user!.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user!.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-100"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user!.id ? "text-blue-100" : "text-slate-400"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-800 bg-slate-900">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-800 border-slate-700 text-slate-100"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                  <Send className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-100 mb-2">Select a conversation</h3>
                <p className="text-slate-400">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
