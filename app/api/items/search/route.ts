import { type NextRequest, NextResponse } from "next/server"

// POST /api/items/search - Search items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, category, type, minPrice, maxPrice, location } = body

    // Mock search results - replace with actual database search
    const searchResults = [
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
      {
        id: "2",
        title: "Mountain Bike",
        description: "Great for trails and city riding",
        category: "Sports",
        price: 30,
        type: "RENT",
        images: ["/placeholder.svg?height=200&width=300&text=Bike"],
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: "Manhattan, NY",
        },
        ownerId: "user_456",
        owner: {
          id: "user_456",
          name: "Jane Smith",
          email: "jane@example.com",
          profileImage: "/placeholder.svg",
          rating: 4.9,
          totalRatings: 18,
        },
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Gaming Console",
        description: "Latest gaming console with controllers",
        category: "Electronics",
        price: 40,
        type: "RENT",
        images: ["/placeholder.svg?height=200&width=300&text=Gaming+Console"],
        location: {
          lat: 40.6892,
          lng: -74.0445,
          address: "Brooklyn, NY",
        },
        ownerId: "user_789",
        owner: {
          id: "user_789",
          name: "Mike Johnson",
          email: "mike@example.com",
          profileImage: "/placeholder.svg",
          rating: 4.7,
          totalRatings: 32,
        },
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    // Filter results based on search criteria
    let filteredResults = searchResults

    if (query) {
      filteredResults = filteredResults.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (category && category !== "all") {
      filteredResults = filteredResults.filter((item) => item.category.toLowerCase() === category.toLowerCase())
    }

    if (type && type !== "all") {
      filteredResults = filteredResults.filter((item) => item.type.toLowerCase() === type.toLowerCase())
    }

    if (minPrice !== undefined) {
      filteredResults = filteredResults.filter((item) => item.price >= minPrice)
    }

    if (maxPrice !== undefined) {
      filteredResults = filteredResults.filter((item) => item.price <= maxPrice)
    }

    return NextResponse.json(filteredResults)
  } catch (error) {
    console.error("Error searching items:", error)
    return NextResponse.json({ error: "Failed to search items" }, { status: 500 })
  }
}
