"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Film, Sparkles, Download } from "lucide-react"
import toast from "react-hot-toast"

export default function VideoPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState<{ id: string; prompt: string; videoUrl: string }[]>([])

  async function handleGenerate() {
    if (!prompt.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), type: "text-to-video" }),
      })
      const data = await res.json()
      if (data.videoUrl) {
        setVideos((prev) => [{ id: crypto.randomUUID(), prompt: prompt.trim(), videoUrl: data.videoUrl }, ...prev])
        setPrompt("")
        toast.success("Video generated!")
      }
    } catch {
      toast.error("Error generating video")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Video Generation</h1>
        <p className="text-sm text-muted-foreground">Create short videos with AI</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="Describe the video you want to create..."
          className="flex-1"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button onClick={handleGenerate} loading={loading} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate
        </Button>
      </div>

      {videos.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Film className="mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">No videos yet</p>
          <p className="text-sm">Enter a prompt above to generate your first video</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {videos.map((v, i) => (
          <Card key={v.id} className="group overflow-hidden">
            <CardContent className="p-2">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <div className="flex h-full items-center justify-center">
                  <Film className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => {
                      const a = document.createElement("a")
                      a.href = v.videoUrl
                      a.download = `wjia-video-${i + 1}.mp4`
                      a.click()
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
              <p className="mt-2 truncate px-1 text-xs text-muted-foreground">{v.prompt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
