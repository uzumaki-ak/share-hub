import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Mock user data - replace with actual database call
    const user = {
      id,
      clerkId: id,
      email: "user@example.com",
      name: "John Doe",
      location: "New York, NY",
      profileImage: "/placeholder.svg?height=100&width=100&text=JD",
      rating: 4.8,
      totalRatings: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if user is updating their own profile
    if (userId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Mock update - replace with actual database call
    const updatedUser = {
      id,
      clerkId: id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
