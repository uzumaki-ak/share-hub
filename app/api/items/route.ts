import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/items - Get all items
export async function GET() {
  try {
    // Mock data for now - replace with actual database calls
    const items = [
      {
        id: "1",
        title: "Professional Camera",
        description: "High-quality DSLR camera perfect for photography",
        category: "Electronics",
        price: 50,
        type: "RENT",
        images: ["/placeholder.svg?height=200&width=300&text=Camera"],
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: "New York, NY",
        },
        ownerId: "user_123",
        owner: {
          id: "user_123",
          name: "John Doe",
          email: "john@example.com",
          profileImage: "/placeholder.svg",
          rating: 4.8,
          totalRatings: 25,
        },
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Mock creation - replace with actual database call
    const newItem = {
      id: `item_${Date.now()}`,
      ...body,
      ownerId: userId,
      owner: {
        id: userId,
        name: "Current User",
        email: "user@example.com",
        profileImage: "/placeholder.svg",
        rating: 5.0,
        totalRatings: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
