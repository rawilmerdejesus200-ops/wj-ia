import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { queryGroq } from "@/lib/models/groq"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const text = buffer.toString("utf-8").slice(0, 10000)

  if (!text.trim()) {
    return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 })
  }

  const analysis = await queryGroq([
    {
      role: "system",
      content: "You are a document analysis expert. Analyze the following document and provide: 1) Summary 2) Key points 3) Main topics 4) Sentiment analysis. Format as markdown.",
    },
    {
      role: "user",
      content: `Document (${file.name}, ${(buffer.length / 1024).toFixed(1)}KB):\n\n${text}`,
    },
  ])

  return NextResponse.json({
    fileName: file.name,
    fileSize: buffer.length,
    analysis,
  })
}
