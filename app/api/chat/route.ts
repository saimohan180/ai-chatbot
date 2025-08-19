import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey:
    "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",
})

export async function POST(req: Request) {
  try {
    const { message, chatHistory } = await req.json()

    // Create context from chat history
    const messages = chatHistory.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }))

    const result = await streamText({
      model: openai("gpt-4o"),
      system: `You are an AI Personal Tutor designed to help students learn effectively. Your role is to:

1. Provide clear, educational explanations tailored to the student's level
2. Break down complex concepts into digestible steps
3. Encourage critical thinking by asking follow-up questions
4. Offer study tips and learning strategies
5. Be patient, supportive, and encouraging
6. Help with homework, but guide students to understand rather than just giving answers
7. Suggest practice problems or additional resources when appropriate

Keep responses concise but comprehensive. Always maintain an encouraging and educational tone.`,
      messages: [
        ...messages,
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("OpenAI API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
