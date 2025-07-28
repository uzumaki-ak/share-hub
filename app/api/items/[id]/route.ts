import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/items/[id] - Get single item
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Mock data - replace with actual database call
    const item = {
      id,
      title: "Professional Camera",
      description:
        "High-quality DSLR camera perfect for photography enthusiasts and professionals. Includes lens kit and accessories.",
      category: "Electronics",
      price: 50,
      type: "RENT",
      images: ["/placeholder.svg?height=400&width=600&text=Professional+Camera"],
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
        profileImage: "/placeholder.svg?height=100&width=100&text=JD",
        rating: 4.8,
        totalRatings: 25,
        location: "New York, NY",
      },
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

// PUT /api/items/[id] - Update item
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Mock update - replace with actual database call
    const updatedItem = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

// DELETE /api/items/[id] - Delete item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Mock deletion - replace with actual database call
    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
