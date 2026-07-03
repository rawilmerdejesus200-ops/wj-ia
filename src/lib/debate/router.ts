import { type ConversationMode } from "@/types/chat"
import { AVAILABLE_MODELS } from "@/types/models"

interface RouterResult {
  models: string[]
  mode: ConversationMode
  judgeModel?: string
}

const TECHNICAL_KEYWORDS = [
  "code", "debug", "algorithm", "architecture", "api", "database",
  "function", "component", "syntax", "error", "implement",
]

const CREATIVE_KEYWORDS = [
  "creative", "idea", "brainstorm", "design", "story", "write",
  "poem", "essay", "creative", "imagine", "concept",
]

export function routeQuery(query: string): RouterResult {
  const lower = query.toLowerCase()
  const words = lower.split(/\s+/)

  const hasTechnical = TECHNICAL_KEYWORDS.some((k) => words.includes(k))
  const hasCreative = CREATIVE_KEYWORDS.some((k) => words.includes(k))
  const isComplex = query.length > 200

  if (isComplex || (hasTechnical && hasCreative)) {
    return {
      models: ["llama-3.1-70b", "mistral-large", "deepseek-v2.5"],
      mode: "DEEP",
      judgeModel: "gpt-4o",
    }
  }

  if (hasTechnical) {
    return {
      models: ["deepseek-v2.5", "llama-3.1-70b"],
      mode: "BALANCED",
      judgeModel: "llama-3.1-70b",
    }
  }

  if (hasCreative) {
    return {
      models: ["mistral-large", "gemini-1.5-flash"],
      mode: "BALANCED",
      judgeModel: "llama-3.1-70b",
    }
  }

  return {
    models: ["llama-3.1-70b"],
    mode: "FAST",
  }
}
