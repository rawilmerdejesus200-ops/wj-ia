import { create } from "zustand"
import { type Message, type ConversationMode } from "@/types/chat"
import { generateId } from "@/lib/utils"

interface ChatState {
  conversations: Map<string, { id: string; title: string; mode: ConversationMode; models: string[] }>
  activeConversationId: string | null
  messages: Message[]
  isStreaming: boolean
  mode: ConversationMode
  selectedModels: string[]
  setMode: (mode: ConversationMode) => void
  setSelectedModels: (models: string[]) => void
  setActiveConversation: (id: string) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setIsStreaming: (streaming: boolean) => void
  createConversation: () => string
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: new Map(),
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  mode: "FAST",
  selectedModels: ["llama-3.1-70b"],
  setMode: (mode) => set({ mode }),
  setSelectedModels: (models) => set({ selectedModels: models }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last) last.content = content
      return { messages: msgs }
    }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  createConversation: () => {
    const id = generateId()
    set((s) => {
      const convs = new Map(s.conversations)
      convs.set(id, { id, title: "New conversation", mode: s.mode, models: s.selectedModels })
      return { conversations: convs, activeConversationId: id, messages: [] }
    })
    return id
  },
}))
