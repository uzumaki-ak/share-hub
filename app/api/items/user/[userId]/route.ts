import { type NextRequest, NextResponse } from "next/server"

// GET /api/items/user/[userId] - Get user's items
export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    // Mock data - replace with actual database call
    const userItems = [
      {
        id: "1",
        title: "Professional Camera",
        description: "High-quality DSLR camera",
        category: "Electronics",
        price: 50,
        type: "RENT",
        images: ["/placeholder.svg?height=200&width=300&text=Camera"],
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: "New York, NY",
        },
        ownerId: userId,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Mountain Bike",
        description: "Great for trails and city riding",
        category: "Sports",
        price: 30,
        type: "RENT",
        images: ["/placeholder.svg?height=200&width=300&text=Bike"],
        location: {
          lat: 40.7128,
          lng: -74.006,
          address: "New York, NY",
        },
        ownerId: userId,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json(userItems)
  } catch (error) {
    console.error("Error fetching user items:", error)
    return NextResponse.json({ error: "Failed to fetch user items" }, { status: 500 })
  }
}
