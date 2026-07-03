"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/store/chat-store"
import { SendHorizontal, Sparkles, Paperclip, Mic, StopCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatInput() {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const { addMessage, setIsStreaming, isStreaming, mode, selectedModels } = useChatStore()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  async function handleSubmit() {
    if (!input.trim() || isStreaming) return

    const userContent = input.trim()
    const conversationId = crypto.randomUUID()

    const userMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role: "user" as const,
      content: userContent,
      createdAt: new Date(),
    }

    addMessage(userMessage)
    setInput("")
    setIsStreaming(true)

    const aiMessageId = crypto.randomUUID()

    const aiMessage = {
      id: aiMessageId,
      conversationId,
      role: "assistant" as const,
      content: "",
      modelName: selectedModels[0] ?? "WJ.IA",
      createdAt: new Date(),
    }

    addMessage(aiMessage)

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userContent,
          conversationId,
          mode,
          models: selectedModels,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.body) {
        useChatStore.getState().updateLastMessage("Error: No response stream available.")
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let synthesisContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const data = JSON.parse(line)
            if (data.type === "token") {
              synthesisContent += data.content
              useChatStore.getState().updateLastMessage(synthesisContent)
            } else if (data.type === "synthesis") {
              synthesisContent = data.content
              useChatStore.getState().updateLastMessage(synthesisContent)
            } else if (data.type === "model") {
              const debateMsg = {
                id: crypto.randomUUID(),
                conversationId,
                role: "assistant" as const,
                content: data.content,
                modelName: data.model,
                score: data.score,
                createdAt: new Date(),
              }
              useChatStore.getState().addMessage(debateMsg)
            }
          } catch {
            synthesisContent += line
            useChatStore.getState().updateLastMessage(synthesisContent)
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        useChatStore.getState().updateLastMessage("Generation stopped.")
      } else {
        useChatStore.getState().updateLastMessage("Error: Failed to get response. Check your API keys.")
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.abort()
    setIsStreaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="relative flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </Button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask WJ.IA anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Mic className="h-4 w-4 text-muted-foreground" />
            </Button>

            {mode === "DEEP" && (
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </Button>
            )}

            <Button
              onClick={isStreaming ? handleStop : handleSubmit}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0",
                isStreaming && "bg-destructive hover:bg-destructive/90",
              )}
            >
              {isStreaming ? (
                <StopCircle className="h-4 w-4" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          WJ.IA can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
