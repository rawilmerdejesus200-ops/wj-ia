const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function queryAnthropic(messages: Message[], model = "claude-3-5-sonnet-20240620"): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 8192,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  const data = await res.json()
  return data.content
    ?.filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("") ?? ""
}

export async function queryAnthropicStream(
  messages: Message[],
  model = "claude-3-5-sonnet-20240620",
): Promise<ReadableStream> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 8192,
      stream: true,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

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
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(parsed.delta.text ?? ""))
            }
          } catch {
            // skip parse errors
          }
        }
      }
      controller.close()
    },
  })
}
