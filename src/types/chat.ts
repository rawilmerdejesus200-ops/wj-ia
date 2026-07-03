export type MessageRole = "user" | "assistant" | "system" | "judge"

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  modelName?: string
  score?: number
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface DebateResponse {
  id: string
  modelName: string
  content: string
  score?: number
  criteria?: Record<string, number>
  createdAt: Date
}

export interface Debate {
  id: string
  conversationId: string
  status: "in_progress" | "completed" | "failed"
  models: string[]
  scores?: Record<string, number>
  synthesis?: string
  responses: DebateResponse[]
  createdAt: Date
  completedAt?: Date
}

export type ConversationMode = "FAST" | "BALANCED" | "DEEP" | "SPECIALIST" | "CUSTOM"

export interface Conversation {
  id: string
  title?: string
  mode: ConversationMode
  models: string[]
  messages: Message[]
  debates: Debate[]
  createdAt: Date
  updatedAt: Date
}
