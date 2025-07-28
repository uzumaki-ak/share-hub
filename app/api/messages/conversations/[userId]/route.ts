import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/messages/conversations/[userId] - Get conversations for user
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: authUserId } = await auth()
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    // Mock conversations - replace with actual database call
    const conversations = [
      {
        id: "conv_1",
        participants: [
          {
            id: userId,
            name: "Current User",
            profileImage: "/placeholder.svg",
          },
          {
            id: "user_123",
            name: "John Doe",
            profileImage: "/placeholder.svg",
          },
        ],
        lastMessage: {
          id: "msg_1",
          content: "Hi, is the camera still available?",
          senderId: "user_123",
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        },
        item: {
          id: "item_1",
          title: "Professional Camera",
          images: ["/placeholder.svg?height=100&width=100&text=Camera"],
        },
        unreadCount: 1,
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "conv_2",
        participants: [
          {
            id: userId,
            name: "Current User",
            profileImage: "/placeholder.svg",
          },
          {
            id: "user_456",
            name: "Jane Smith",
            profileImage: "/placeholder.svg",
          },
        ],
        lastMessage: {
          id: "msg_2",
          content: "Thanks for the quick response!",
          senderId: userId,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        item: {
          id: "item_2",
          title: "Mountain Bike",
          images: ["/placeholder.svg?height=100&width=100&text=Bike"],
        },
        unreadCount: 0,
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// POST /api/messages/conversations/[userId] - Create new conversation
export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: authUserId } = await auth()
    if (!authUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params
    const body = await request.json()
    const { itemId, message } = body

    // Mock conversation creation - replace with actual database call
    const newConversation = {
      id: `conv_${Date.now()}`,
      participants: [
        {
          id: authUserId,
          name: "Current User",
          profileImage: "/placeholder.svg",
        },
        {
          id: userId,
          name: "Other User",
          profileImage: "/placeholder.svg",
        },
      ],
      lastMessage: {
        id: `msg_${Date.now()}`,
        content: message,
        senderId: authUserId,
        createdAt: new Date().toISOString(),
      },
      item: {
        id: itemId,
        title: "Item Title",
        images: ["/placeholder.svg"],
      },
      unreadCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newConversation, { status: 201 })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
