// Prisma-based TypeScript interfaces
export interface User {
  id: string
  email: string
  name: string
  location: string
  profileImage?: string
  rating: number
  createdAt: Date
  updatedAt: Date
}

export interface Item {
  id: string
  title: string
  description: string
  category: string
  price: number
  type: "RENT" | "SELL" | "GIVEAWAY"
  startDate?: Date
  endDate?: Date
  images: string[]
  location: {
    lat: number
    lng: number
    address: string
  }
  ownerId: string
  owner: User
  available: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  itemId: string
  item: Item
  borrowerId: string
  borrower: User
  startDate: Date
  endDate: Date
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED"
  totalCost: number
  returned: boolean
  isLate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  itemId: string
  item: Item
  bidderId: string
  bidder: User
  amount: number
  isWinning: boolean
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  sender: User
  receiverId: string
  receiver: User
  content: string
  itemId?: string
  item?: Item
  read: boolean
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  user: User
  type: "MESSAGE" | "BOOKING" | "RETURN" | "BID" | "MATCH"
  title: string
  content: string
  read: boolean
  actionUrl?: string
  createdAt: Date
}

export interface Rating {
  id: string
  raterId: string
  rater: User
  ratedUserId: string
  ratedUser: User
  itemId?: string
  item?: Item
  rating: number
  comment?: string
  createdAt: Date
}

export interface Inquiry {
  id: string
  itemId: string
  item: Item
  askerId: string
  asker: User
  question: string
  answer?: string
  answeredAt?: Date
  createdAt: Date
}

export interface SearchFilters {
  keyword?: string
  category?: string
  radius?: number
  minPrice?: number
  maxPrice?: number
  type?: "RENT" | "SELL" | "GIVEAWAY"
  location?: {
    lat: number
    lng: number
  }
}
