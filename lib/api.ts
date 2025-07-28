import type { SearchFilters, Item, User, Booking, Message, Notification, Rating, Inquiry, Bid } from "./types"

const API_BASE = "/api"

// Generic fetch wrapper with error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Items API
export const itemsApi = {
  getAll: () => apiRequest<Item[]>("/items"),
  getById: (id: string) => apiRequest<Item>(`/items/${id}`),
  create: (data: Partial<Item>) =>
    apiRequest<Item>("/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Item>) =>
    apiRequest<Item>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/items/${id}`, {
      method: "DELETE",
    }),
  search: (filters: SearchFilters) =>
    apiRequest<Item[]>("/items/search", {
      method: "POST",
      body: JSON.stringify(filters),
    }),
  getUserItems: (userId: string) => apiRequest<Item[]>(`/items/user/${userId}`),
}

// Users API
export const usersApi = {
  getById: (id: string) => apiRequest<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    apiRequest<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getRatings: (id: string) => apiRequest<Rating[]>(`/users/${id}/ratings`),
}

// Bookings API
export const bookingsApi = {
  create: (data: Partial<Booking>) =>
    apiRequest<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getUserBookings: (userId: string) => apiRequest<Booking[]>(`/bookings/user/${userId}`),
  update: (id: string, data: Partial<Booking>) =>
    apiRequest<Booking>(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  markReturned: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}/return`, {
      method: "POST",
    }),
}

// Messages API
export const messagesApi = {
  getConversations: (userId: string) => apiRequest<Message[]>(`/messages/conversations/${userId}`),
  getMessages: (userId1: string, userId2: string) => apiRequest<Message[]>(`/messages/${userId1}/${userId2}`),
  send: (data: Partial<Message>) =>
    apiRequest<Message>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  markRead: (id: string) =>
    apiRequest<void>(`/messages/${id}/read`, {
      method: "POST",
    }),
}

// Notifications API
export const notificationsApi = {
  getByUser: (userId: string) => apiRequest<Notification[]>(`/notifications/${userId}`),
  markRead: (id: string) =>
    apiRequest<void>(`/notifications/${id}/read`, {
      method: "POST",
    }),
  markAllRead: (userId: string) =>
    apiRequest<void>(`/notifications/${userId}/read-all`, {
      method: "POST",
    }),
}

// Ratings API
export const ratingsApi = {
  create: (data: Partial<Rating>) =>
    apiRequest<Rating>("/ratings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByUser: (userId: string) => apiRequest<Rating[]>(`/ratings/user/${userId}`),
}

// Inquiries API
export const inquiriesApi = {
  create: (data: Partial<Inquiry>) =>
    apiRequest<Inquiry>("/inquiries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByItem: (itemId: string) => apiRequest<Inquiry[]>(`/inquiries/item/${itemId}`),
  answer: (id: string, answer: string) =>
    apiRequest<Inquiry>(`/inquiries/${id}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),
}

// Bids API
export const bidsApi = {
  create: (data: Partial<Bid>) =>
    apiRequest<Bid>("/bids", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getByItem: (itemId: string) => apiRequest<Bid[]>(`/bids/item/${itemId}`),
  getByUser: (userId: string) => apiRequest<Bid[]>(`/bids/user/${userId}`),
}
