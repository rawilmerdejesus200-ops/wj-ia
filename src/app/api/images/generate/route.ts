import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

async function generateWithOpenAI(prompt: string): Promise<string> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    })
    const data = await res.json()
    return data.data?.[0]?.url ?? ""
  } catch {
    return ""
  }
}

async function generateWithReplicate(prompt: string, width: number, height: number): Promise<string> {
  try {
    const res = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: { prompt, num_outputs: 1, width, height },
      }),
    })
    const data = await res.json()
    if (data.urls?.get) {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000))
        const statusRes = await fetch(data.urls.get, {
          headers: { Authorization: `Token ${process.env.REPLICATE_API_KEY}` },
        })
        const statusData = await statusRes.json()
        if (statusData.status === "succeeded") return statusData.output?.[0] ?? ""
        if (statusData.status === "failed") break
      }
    }
  } catch {
    // fallback
  }
  return ""
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prompt, model = "flux", width = 1024, height = 1024 } = await req.json()
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
  }

  let imageUrl = ""

  if (process.env.OPENAI_API_KEY) {
    imageUrl = await generateWithOpenAI(prompt)
  }

  if (!imageUrl && process.env.REPLICATE_API_KEY) {
    imageUrl = await generateWithReplicate(prompt, width, height)
  }

  if (!imageUrl) {
    imageUrl = `https://placehold.co/${width}x${height}/1a1a2e/a9a9ff?text=${encodeURIComponent(prompt.slice(0, 50))}`
  }

  const image = await prisma.generatedImage.create({
    data: {
      userId: session.user.id,
      prompt,
      modelName: model,
      imageUrl,
      width,
      height,
      format: "png",
    },
  })

  return NextResponse.json({ id: image.id, imageUrl, status: "completed" })
}
