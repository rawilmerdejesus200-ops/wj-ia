export type ModelProvider =
  | "OPENAI"
  | "ANTHROPIC"
  | "GROQ"
  | "MISTRAL"
  | "GOOGLE"
  | "DEEPSEEK"
  | "HUGGINGFACE"
  | "OLLAMA"

export type ModelTier = "premium" | "free" | "local"

export interface AIModel {
  id: string
  name: string
  provider: ModelProvider
  tier: ModelTier
  description: string
  capabilities: string[]
  maxTokens: number
  isAvailable: boolean
  requiresKey: boolean
  color?: string
  icon?: string
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "ANTHROPIC",
    tier: "premium",
    description: "Best-in-class reasoning and coding",
    capabilities: ["reasoning", "coding", "analysis", "creative"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: true,
    color: "#d97706",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OPENAI",
    tier: "premium",
    description: "Multimodal, fast, and versatile",
    capabilities: ["reasoning", "coding", "analysis", "vision"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: true,
    color: "#10a37f",
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    provider: "GROQ",
    tier: "free",
    description: "Fast open-source model via Groq",
    capabilities: ["reasoning", "coding", "analysis"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: false,
    color: "#8b5cf6",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "MISTRAL",
    tier: "free",
    description: "Powerful European model",
    capabilities: ["reasoning", "coding", "multilingual"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: false,
    color: "#ec4899",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "GOOGLE",
    tier: "free",
    description: "Fast, efficient, free tier",
    capabilities: ["reasoning", "coding", "vision", "multilingual"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: false,
    color: "#4285f4",
  },
  {
    id: "deepseek-v2.5",
    name: "DeepSeek V2.5",
    provider: "DEEPSEEK",
    tier: "free",
    description: "Strong coding and reasoning",
    capabilities: ["reasoning", "coding", "analysis"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: false,
    color: "#06b6d4",
  },
  {
    id: "qwen-2.5-72b",
    name: "Qwen 2.5 72B",
    provider: "HUGGINGFACE",
    tier: "free",
    description: "Strong multilingual model",
    capabilities: ["reasoning", "coding", "multilingual"],
    maxTokens: 8192,
    isAvailable: true,
    requiresKey: false,
    color: "#f97316",
  },
]
