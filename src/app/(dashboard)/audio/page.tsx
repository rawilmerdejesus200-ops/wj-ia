"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Sparkles, Play, Download } from "lucide-react"
import toast from "react-hot-toast"

export default function AudioPage() {
  const [ttsText, setTtsText] = useState("")
  const [musicPrompt, setMusicPrompt] = useState("")
  const [loadingTts, setLoadingTts] = useState(false)
  const [loadingMusic, setLoadingMusic] = useState(false)
  const [audioSrc, setAudioSrc] = useState("")

  async function handleTTS() {
    if (!ttsText.trim() || loadingTts) return
    setLoadingTts(true)
    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText.trim(), type: "tts" }),
      })
      const data = await res.json()
      if (data.audioUrl) {
        setAudioSrc(data.audioUrl)
        toast.success("Audio generated!")
      } else {
        toast(data.message ?? "TTS generated (API key needed for audio playback)")
      }
    } catch {
      toast.error("Error generating audio")
    } finally {
      setLoadingTts(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audio Generation</h1>
        <p className="text-sm text-muted-foreground">Generate speech, music, and sound effects</p>
      </div>

      {audioSrc && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-4 p-4">
            <Play className="h-8 w-8 text-violet-400" />
            <audio controls className="flex-1">
              <source src={audioSrc} type="audio/mpeg" />
            </audio>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium">Text to Speech</h3>
            <Input
              placeholder="Enter text to speak..."
              className="mb-2"
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
            />
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={handleTTS}
              loading={loadingTts}
            >
              <Sparkles className="h-3 w-3" /> Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium">Music Generation</h3>
            <Input
              placeholder="Describe the music..."
              className="mb-2"
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
            />
            <Button
              size="sm"
              className="w-full gap-2"
              loading={loadingMusic}
              onClick={async () => {
                if (!musicPrompt.trim()) return
                setLoadingMusic(true)
                toast("Music generation requires a dedicated API service")
                setLoadingMusic(false)
              }}
            >
              <Sparkles className="h-3 w-3" /> Generate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium">Voice Cloning</h3>
            <Input placeholder="Upload a voice sample..." className="mb-2" />
            <Button size="sm" className="w-full gap-2">
              <Sparkles className="h-3 w-3" /> Start
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
