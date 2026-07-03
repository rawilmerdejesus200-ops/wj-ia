"use client"

import { useChatStore } from "@/store/chat-store"
import { useUIStore } from "@/store/ui-store"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { ModelSelector } from "@/components/chat/model-selector"
import { DebatePanel } from "@/components/chat/debate-panel"
import { Button } from "@/components/ui/button"
import { MessageSquare, Sparkles, PanelRightOpen } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatPage() {
  const { messages, isStreaming, createConversation } = useChatStore()
  const { debatePanelOpen, setDebatePanelOpen, mode } = useUIStore()

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <DebatePanel />

      <div className="flex items-center justify-between border-b px-4 py-2 md:px-6">
        <div className="flex items-center gap-2">
          <ModelSelector />
        </div>
        <div className="flex items-center gap-2">
          {(mode === "BALANCED" || mode === "DEEP" || mode === "SPECIALIST") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDebatePanelOpen(!debatePanelOpen)}
              className="gap-1.5"
            >
              <PanelRightOpen className="h-4 w-4" />
              <span className="hidden text-xs sm:inline">Debate</span>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={createConversation} className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden text-xs sm:inline">New</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20"
            >
              <Sparkles className="h-10 w-10 text-violet-400" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold"
            >
              What can I help with?
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              Ask anything — code, analysis, creativity, or research
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4"
            >
              {[
                "Write a Python script to analyze CSV data",
                "Explain quantum computing simply",
                "Debug this React component",
                "Create a business plan template",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    const msg = {
                      id: crypto.randomUUID(),
                      conversationId: "",
                      role: "user" as const,
                      content: suggestion,
                      createdAt: new Date(),
                    }
                    useChatStore.getState().addMessage(msg)
                  }}
                  className="rounded-xl border bg-card p-3 text-left text-xs hover:bg-accent"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-3 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0.2s]" />
                </div>
                <span className="text-xs text-muted-foreground">WJ.IA is thinking...</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  )
}
