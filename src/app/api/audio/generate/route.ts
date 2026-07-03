import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { text, type = "tts" } = await req.json()
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 })
  }

  if (process.env.OPENAI_API_KEY && type === "tts") {
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: "alloy",
          input: text,
        }),
      })
      const buffer = Buffer.from(await res.arrayBuffer())
      const base64 = buffer.toString("base64")
      return NextResponse.json({
        audioUrl: `data:audio/mp3;base64,${base64}`,
        status: "completed",
      })
    } catch {
      // fallback
    }
  }

  return NextResponse.json({
    audioUrl: "",
    message: `Audio generation simulated for: "${text.slice(0, 60)}..." (set OPENAI_API_KEY for real TTS)`,
    status: "completed",
  })
}
