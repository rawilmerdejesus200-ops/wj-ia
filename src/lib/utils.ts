import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { queryGroq, queryGroqStream } from "@/lib/models/groq"
import { queryOpenAI, queryOpenAIStream } from "@/lib/models/openai"
import { queryAnthropic, queryAnthropicStream } from "@/lib/models/anthropic"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateId() {
  return crypto.randomUUID()
}

interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function queryModel(messages: AIMessage[], modelId: string): Promise<string> {
  const provider = modelId.startsWith("gpt") ? "openai"
    : modelId.startsWith("claude") ? "anthropic"
    : "groq"

  switch (provider) {
    case "openai":
      return queryOpenAI(messages, modelId)
    case "anthropic": {
      const msgs = messages.filter((m) => m.role !== "system")
      const systemMsg = messages.find((m) => m.role === "system")
      const final = systemMsg
        ? [{ role: "user" as const, content: `${systemMsg.content}\n\n${msgs.map((m) => `${m.role}: ${m.content}`).join("\n")}` }]
        : msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      return queryAnthropic(final, modelId)
    }
    default:
      return queryGroq(messages, modelId)
  }
}

export async function queryModelStream(messages: AIMessage[], modelId: string): Promise<ReadableStream> {
  const provider = modelId.startsWith("gpt") ? "openai"
    : modelId.startsWith("claude") ? "anthropic"
    : "groq"

  switch (provider) {
    case "openai":
      return queryOpenAIStream(messages, modelId)
    case "anthropic": {
      const msgs = messages.filter((m) => m.role !== "system")
      const systemMsg = messages.find((m) => m.role === "system")
      const final = systemMsg
        ? [{ role: "user" as const, content: `${systemMsg.content}\n\n${msgs.map((m) => `${m.role}: ${m.content}`).join("\n")}` }]
        : msgs.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
      return queryAnthropicStream(final, modelId)
    }
    default:
      return queryGroqStream(messages, modelId)
  }
}
