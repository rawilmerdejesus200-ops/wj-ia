import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  theme: "dark" | "light"
  isMobile: boolean
  debatePanelOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: "dark" | "light") => void
  setIsMobile: (mobile: boolean) => void
  setDebatePanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  isMobile: false,
  debatePanelOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setIsMobile: (mobile) => set({ isMobile: mobile, sidebarOpen: !mobile }),
  setDebatePanelOpen: (open) => set({ debatePanelOpen: open }),
}))
