import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { queryModel, queryModelStream, generateId } from "@/lib/utils"
import { routeQuery } from "@/lib/debate/router"
import { judgeResponse } from "@/lib/debate/judge"
import { synthesizeResponses } from "@/lib/debate/synthesizer"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { message, conversationId, mode: reqMode, models: reqModels } = await req.json()
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const routing = routeQuery(message)
  const mode = reqMode ?? routing.mode
  const models = reqModels ?? routing.models
  const systemPrompt = "You are WJ.IA, a helpful, accurate, and thoughtful AI assistant. Provide clear, well-structured responses."

  const conversation = await prisma.conversation.upsert({
    where: { id: conversationId ?? "" },
    update: { updatedAt: new Date() },
    create: {
      id: conversationId ?? generateId(),
      userId: session.user.id,
      title: message.slice(0, 80),
      mode,
      models: JSON.stringify(models),
    },
  })

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  })

  const isMultiModel = models.length > 1

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (data: string) => controller.enqueue(encoder.encode(data))

      try {
        if (isMultiModel) {
          const responses = await Promise.all(
            models.map(async (modelId: string) => {
              try {
                const content = await queryModel(
                  [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
                  modelId,
                )
                return { modelName: modelId, content }
              } catch {
                return { modelName: modelId, content: `[${modelId} unavailable]` }
              }
            }),
          )

          const judged = await Promise.all(
            responses.map(async (r) => {
              try {
                return await judgeResponse(message, r.content, r.modelName)
              } catch {
                return { score: 5, criteria: { precision: 5, completeness: 5, clarity: 5, creativity: 5, safety: 5 } }
              }
            }),
          )

          const scoredResponses = responses.map((r, i) => ({ ...r, score: judged[i].score }))

          const debate = await prisma.debate.create({
            data: {
              conversationId: conversation.id,
              models: JSON.stringify(models),
              scores: JSON.stringify(Object.fromEntries(scoredResponses.map((r) => [r.modelName, r.score]))),
              responses: {
                create: scoredResponses.map((r) => ({
                  modelName: r.modelName,
                  content: r.content,
                  score: r.score,
                })),
              },
            },
          })

          scoredResponses.forEach((r) => {
            send(JSON.stringify({ type: "model", model: r.modelName, content: r.content, score: r.score }) + "\n")
          })

          let synthesis = ""
          try {
            synthesis = await synthesizeResponses(message, scoredResponses)
          } catch {
            synthesis = scoredResponses.sort((a, b) => b.score - a.score)[0]?.content ?? ""
          }

          await prisma.debate.update({
            where: { id: debate.id },
            data: { synthesis, status: "completed", completedAt: new Date() },
          })

          send(JSON.stringify({ type: "synthesis", content: synthesis }) + "\n")
          send(JSON.stringify({ type: "done" }) + "\n")

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: synthesis,
              modelName: "synthesis",
            },
          })
        } else {
          const modelId = models[0] ?? "llama-3.1-70b"
          let fullContent = ""

          try {
            const aiStream = await queryModelStream(
              [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
              modelId,
            )
            const reader = aiStream.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              const text = new TextDecoder().decode(value)
              fullContent += text
              send(JSON.stringify({ type: "token", content: text }) + "\n")
            }
          } catch {
            const fallback = await queryModel(
              [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
              modelId,
            )
            fullContent = fallback
            send(JSON.stringify({ type: "token", content: fallback }) + "\n")
          }

          send(JSON.stringify({ type: "done", model: modelId }) + "\n")

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: fullContent,
              modelName: modelId,
            },
          })
        }
      } catch (error) {
        send(JSON.stringify({ type: "error", content: "Failed to generate response. Check your API keys." }) + "\n")
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  })

  return NextResponse.json(conversations)
}
