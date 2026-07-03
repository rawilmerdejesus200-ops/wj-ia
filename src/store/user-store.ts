import { create } from "zustand"
import { type User, type SubscriptionTier } from "@/types/user"

interface UserState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  updateCredits: (used: number) => void
  updateSubscription: (tier: SubscriptionTier) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateCredits: (used) =>
    set((s) => (s.user ? { user: { ...s.user, creditsUsed: used } } : s)),
  updateSubscription: (tier) =>
    set((s) => (s.user ? { user: { ...s.user, subscription: tier } } : s)),
}))
