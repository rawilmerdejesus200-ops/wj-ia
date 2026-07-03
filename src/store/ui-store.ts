import { create } from "zustand"

type DebateMode = "BALANCED" | "DEEP" | "SPECIALIST"

interface UIState {
  sidebarOpen: boolean
  theme: "dark" | "light"
  isMobile: boolean
  debatePanelOpen: boolean
  mode: DebateMode
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: "dark" | "light") => void
  setIsMobile: (mobile: boolean) => void
  setDebatePanelOpen: (open: boolean) => void
  setMode: (mode: DebateMode) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  isMobile: false,
  debatePanelOpen: false,
  mode: "BALANCED",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setIsMobile: (mobile) => set({ isMobile: mobile, sidebarOpen: !mobile }),
  setDebatePanelOpen: (open) => set({ debatePanelOpen: open }),
  setMode: (mode) => set({ mode }),
}))
