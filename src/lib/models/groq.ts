const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

interface GroqMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function queryGroq(
  messages: GroqMessage[],
  model = "llama-3.1-70b-versatile",
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 8192,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content ?? ""
}

export async function queryGroqStream(
  messages: GroqMessage[],
  model = "llama-3.1-70b-versatile",
): Promise<ReadableStream> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 8192,
      stream: true,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error: ${error}`)
  }

  return response.body!
}
