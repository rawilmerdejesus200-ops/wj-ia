"use client"

import { useUIStore } from "@/store/ui-store"
import { useChatStore } from "@/store/chat-store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MessageSquarePlus,
  MessageSquare,
  Image,
  Video,
  Code2,
  FileText,
  Music,
  Search,
  Settings,
  HelpCircle,
  ChevronLeft,
  Trash2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const tools = [
  { id: "images", label: "Images", icon: Image },
  { id: "video", label: "Video", icon: Video },
  { id: "code", label: "Code", icon: Code2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audio", label: "Audio", icon: Music },
]

export function Sidebar() {
  const { sidebarOpen, isMobile, setSidebarOpen } = useUIStore()
  const { conversations, setActiveConversation, createConversation, activeConversationId } = useChatStore()

  const convs = Array.from(conversations.values())

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
          animate={
            isMobile
              ? { x: 0 }
              : { width: "auto", opacity: 1 }
          }
          exit={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn(
            "flex h-[calc(100vh-4rem)] flex-col border-r bg-sidebar",
            isMobile
              ? "fixed left-0 top-16 z-40 w-72 shadow-2xl"
              : "w-72 shrink-0",
          )}
        >
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-semibold text-sidebar-foreground">History</h2>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="px-3 pb-3">
            <Button onClick={createConversation} className="w-full gap-2" size="sm">
              <MessageSquarePlus className="h-4 w-4" />
              New chat
            </Button>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto px-3 scrollbar-hide">
            {convs.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-xs text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-30" />
                <p>No conversations yet</p>
              </div>
            )}
            {convs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeConversationId === conv.id
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-muted",
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex-1 truncate">{conv.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-6 w-6 shrink-0 group-hover:flex"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </button>
            ))}
          </div>

          <div className="border-t p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-muted">
                <Search className="h-3.5 w-3.5" />
                Search
              </div>
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/${tool.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-muted"
                >
                  <tool.icon className="h-3.5 w-3.5" />
                  {tool.label}
                </Link>
              ))}
            </div>
            <hr className="my-2 border-border" />
            <Link href="/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-muted">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-muted">
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
