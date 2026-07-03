import { queryGroq } from "@/lib/models/groq"

interface Criteria {
  precision: number
  completeness: number
  clarity: number
  creativity: number
  safety: number
}

export async function judgeResponse(query: string, response: string, modelName: string): Promise<{ score: number; criteria: Criteria }> {
  const prompt = `You are a judge evaluating an AI response. Score each criterion 0-10.

Query: "${query}"

Model: ${modelName}
Response: "${response}"

Return ONLY a JSON object with scores for: precision, completeness, clarity, creativity, safety`

  const result = await queryGroq([
    { role: "system", content: "You are a strict but fair judge. Return only valid JSON." },
    { role: "user", content: prompt },
  ])

  try {
    const criteria: Criteria = JSON.parse(result)
    const score =
      criteria.precision * 0.3 +
      criteria.completeness * 0.25 +
      criteria.clarity * 0.2 +
      criteria.creativity * 0.15 +
      criteria.safety * 0.1

    return { score, criteria }
  } catch {
    return {
      score: 7,
      criteria: { precision: 7, completeness: 7, clarity: 7, creativity: 7, safety: 7 },
    }
  }
}
