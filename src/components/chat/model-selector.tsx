"use client"

import { useState } from "react"
import { useChatStore } from "@/store/chat-store"
import { AVAILABLE_MODELS } from "@/types/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ModelSelector() {
  const { selectedModels, setSelectedModels, mode, setMode } = useChatStore()
  const [open, setOpen] = useState(false)

  const modes = [
    { id: "FAST" as const, label: "Fast", desc: "Single model, instant" },
    { id: "BALANCED" as const, label: "Balanced", desc: "2 models, light debate" },
    { id: "DEEP" as const, label: "Deep", desc: "3-5 models, full debate" },
    { id: "SPECIALIST" as const, label: "Specialist", desc: "Expert models, focused answers" },
  ]

  function handleModelToggle(modelId: string) {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((m) => m !== modelId))
      }
    } else {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-xs">
          {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""}
        </span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border bg-popover p-3 shadow-lg"
          >
            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Mode</p>
              <div className="flex gap-1">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id)
                      if (m.id === "FAST") setSelectedModels(["llama-3.1-70b"])
                      else if (m.id === "BALANCED") setSelectedModels(["llama-3.1-70b", "mistral-large"])
                      else if (m.id === "DEEP") setSelectedModels(["llama-3.1-70b", "mistral-large", "deepseek-v2.5"])
                      else if (m.id === "SPECIALIST") setSelectedModels(["llama-3.1-70b", "deepseek-v2.5"])
                    }}
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-center text-xs transition-colors",
                      mode === m.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mb-2 text-xs font-medium text-muted-foreground">Models</p>
            <div className="space-y-1">
              {AVAILABLE_MODELS.filter((m) => m.tier !== "local").map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelToggle(model.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    selectedModels.includes(model.id) && "bg-accent",
                  )}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge variant={model.tier === "premium" ? "premium" : "free"}>
                        {model.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  {selectedModels.includes(model.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
