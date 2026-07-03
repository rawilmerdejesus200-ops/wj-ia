const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

async function fetchCompletion(messages: Message[], model: string, stream = false): Promise<Response> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 8192,
      stream,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  return res
}

export async function queryOpenAI(messages: Message[], model = "gpt-4o"): Promise<string> {
  const res = await fetchCompletion(messages, model, false)
  const data = await res.json()
  return data.choices[0]?.message?.content ?? ""
}

export async function queryOpenAIStream(
  messages: Message[],
  model = "gpt-4o",
): Promise<ReadableStream> {
  const res = await fetchCompletion(messages, model, true)
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      const reader = res.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith("data: ")) continue
          const jsonStr = trimmed.slice(6)
          if (jsonStr === "[DONE]") continue
          try {
            const parsed = JSON.parse(jsonStr)
            const content = parsed.choices[0]?.delta?.content ?? ""
            if (content) controller.enqueue(encoder.encode(content))
          } catch {
            // skip parse errors
          }
        }
      }
      controller.close()
    },
  })
}
