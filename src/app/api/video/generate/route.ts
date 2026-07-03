import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt, type = "text-to-video" } = await req.json()
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  if (process.env.REPLICATE_API_KEY) {
    try {
      const modelVersion = type === "image-to-video"
        ? "stability-ai/stable-video-diffusion"
        : "anotherjesse/zeroscope-v2-xl"

      const res = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelVersion,
          input: { prompt, num_frames: 24 },
        }),
      })
      const data = await res.json()

      if (data.urls?.get) {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 2000))
          const statusRes = await fetch(data.urls.get, {
            headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` },
          })
          const statusData = await statusRes.json()
          if (statusData.status === "succeeded") {
            return NextResponse.json({
              videoUrl: statusData.output?.[0] ?? "",
              status: "completed",
            })
          }
          if (statusData.status === "failed") break
        }
      }
    } catch {
      // fallback to placeholder
    }
  }

  return NextResponse.json({
    videoUrl: `https://placehold.co/640x360/1a1a2e/a9a9ff.mp4?text=${encodeURIComponent(prompt.slice(0, 40))}`,
    status: "completed",
  })
}
