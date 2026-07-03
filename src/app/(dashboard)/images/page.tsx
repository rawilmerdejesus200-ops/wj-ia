"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon, Download, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
}

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])

  async function handleGenerate() {
    if (!prompt.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await res.json()
      if (data.imageUrl) {
        setImages((prev) => [{ id: data.id, prompt: prompt.trim(), imageUrl: data.imageUrl }, ...prev])
        setPrompt("")
        toast.success("Image generated!")
      } else {
        toast.error("Failed to generate image")
      }
    } catch {
      toast.error("Error generating image")
    } finally {
      setLoading(false)
    }
  }

  function handleDownload(url: string, index: number) {
    const a = document.createElement("a")
    a.href = url
    a.download = `wjia-image-${index + 1}.png`
    a.click()
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Image Generation</h1>
        <p className="text-sm text-muted-foreground">Create stunning images with AI</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="A futuristic cityscape with neon lights..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          className="flex-1"
        />
        <Button onClick={handleGenerate} loading={loading} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate
        </Button>
      </div>

      {images.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <ImageIcon className="mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">No images yet</p>
          <p className="text-sm">Enter a prompt above to generate your first image</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <Card key={img.id} className="group overflow-hidden">
            <CardContent className="p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-1.5 text-xs"
                    onClick={() => handleDownload(img.imageUrl, i)}
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
              <p className="mt-2 truncate px-1 text-xs text-muted-foreground">{img.prompt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
