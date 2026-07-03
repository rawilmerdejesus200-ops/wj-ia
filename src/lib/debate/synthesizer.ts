import { queryGroq } from "@/lib/models/groq"

interface DebateInput {
  modelName: string
  content: string
  score: number
}

export async function synthesizeResponses(
  query: string,
  responses: DebateInput[],
): Promise<string> {
  const responsesText = responses
    .map((r) => `[${r.modelName} (score: ${r.score}/10)]:\n${r.content}`)
    .join("\n\n---\n\n")

  const prompt = `You are a synthesis expert. Combine the best parts of these AI responses into one unified, coherent answer.

Original query: "${query}"

Responses:
${responsesText}

Provide a synthesized answer that:
1. Captures the strongest points from each response
2. Resolves any contradictions
3. Flows naturally as one coherent response
4. Is comprehensive and well-structured`

  return queryGroq([
    { role: "system", content: "You synthesize multiple AI responses into one coherent answer." },
    { role: "user", content: prompt },
  ])
}
