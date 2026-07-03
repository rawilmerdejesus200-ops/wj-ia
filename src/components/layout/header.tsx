"use client"

import { useSession, signOut } from "next-auth/react"
import { useUIStore } from "@/store/ui-store"
import { useChatStore } from "@/store/chat-store"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

const modes = [
  { id: "FAST" as const, label: "Fast", icon: "⚡" },
  { id: "BALANCED" as const, label: "Balanced", icon: "⚖️" },
  { id: "DEEP" as const, label: "Deep", icon: "🔬" },
  { id: "SPECIALIST" as const, label: "Specialist", icon: "🎯" },
]

export function Header() {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore()
  const { mode, setMode, setSelectedModels } = useChatStore()
  const { data: session } = useSession()
  const [modeOpen, setModeOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function handleModeSelect(m: (typeof modes)[number]) {
    setMode(m.id)
    if (m.id === "FAST") setSelectedModels(["llama-3.1-70b"])
    else if (m.id === "BALANCED") setSelectedModels(["llama-3.1-70b", "mistral-large"])
    else if (m.id === "DEEP") setSelectedModels(["llama-3.1-70b", "mistral-large", "deepseek-v2.5"])
    else if (m.id === "SPECIALIST") setSelectedModels(["llama-3.1-70b", "deepseek-v2.5"])
    setModeOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
          {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            WJ<span className="text-violet-400">.</span>IA
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModeOpen(!modeOpen)}
            className="hidden gap-1.5 sm:flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-medium">{modes.find((m) => m.id === mode)?.label ?? "Fast"}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
          {modeOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border bg-popover p-1 shadow-lg">
              {modes.map((m) => (
                <button
                  key={m.id}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  onClick={() => handleModeSelect(m)}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Badge variant="free" className="hidden md:flex">
          45 / 50 credits
        </Badge>

        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent"
          >
            <Avatar
              src={session?.user?.image ?? undefined}
              name={session?.user?.name ?? "User"}
              size="sm"
            />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight">{session?.user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground">Free plan</p>
            </div>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border bg-popover p-1 shadow-lg">
              <Link href="/settings" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}>
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link href="/settings" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent" onClick={() => setUserMenuOpen(false)}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <hr className="my-1 border-border" />
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
