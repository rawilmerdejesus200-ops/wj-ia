export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE"

export interface User {
  id: string
  name?: string
  email?: string
  image?: string
  subscription: SubscriptionTier
  creditsUsed: number
  creditsLimit: number
  storageUsed: number
  storageLimit: number
}

export interface UserApiKey {
  id: string
  provider: string
  keyPrefix: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}
