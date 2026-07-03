"use client"

import { useUIStore } from "@/store/ui-store"
import { useChatStore } from "@/store/chat-store"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { X, Trophy, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

export function DebatePanel() {
  const { debatePanelOpen, setDebatePanelOpen } = useUIStore()
  const { messages, mode } = useChatStore()

  const debateMessages = messages.filter((m) => m.role === "assistant" && m.modelName)

  if (mode === "FAST" || mode === "SPECIALIST") return null

  return (
    <AnimatePresence>
      {debatePanelOpen && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-96 border-l bg-background shadow-2xl"
        >
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold">Debate Arena</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setDebatePanelOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-full overflow-y-auto pb-20 scrollbar-hide">
            {debateMessages.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
                <BarChart3 className="h-10 w-10 opacity-30" />
                <p>Send a message in Deep mode</p>
                <p className="text-xs">to see model debates</p>
              </div>
            )}

            {debateMessages.map((msg, i) => {
              const modelColors: Record<string, string> = {
                "llama-3.1-70b": "bg-violet-500",
                "mistral-large": "bg-pink-500",
                "deepseek-v2.5": "bg-cyan-500",
                "gemini-1.5-flash": "bg-blue-500",
              }

              return (
                <div key={msg.id} className="border-b p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", modelColors[msg.modelName ?? ""] ?? "bg-gray-500")} />
                    <span className="text-xs font-medium">{msg.modelName}</span>
                    {msg.score !== undefined && (
                      <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        {msg.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-xs max-w-none text-sm dark:prose-invert">
                    <ReactMarkdown>{msg.content.slice(0, 300) + (msg.content.length > 300 ? "..." : "")}</ReactMarkdown>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
