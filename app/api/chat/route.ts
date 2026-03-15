import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const PROVIDER_BASE_URLS: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1",
  together: "https://api.together.xyz/v1",
  perplexity: "https://api.perplexity.ai",
  deepseek: "https://api.deepseek.com/v1",
  mistral: "https://api.mistral.ai/v1",
}

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  google: "gemini-1.5-pro",
  groq: "llama-3.3-70b-versatile",
  together: "meta-llama/Llama-3-70b-chat-hf",
  perplexity: "llama-3.1-sonar-large-128k-online",
  deepseek: "deepseek-chat",
  mistral: "mistral-large-latest",
  azure: "gpt-4o",
  custom: "gpt-4o",
}

function createModel(provider: string, apiKey: string, model?: string, baseUrl?: string) {
  const modelId = model || DEFAULT_MODELS[provider] || "gpt-4o"

  if (provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey })
    return anthropic(modelId)
  }

  if (provider === "google") {
    const google = createGoogleGenerativeAI({ apiKey })
    return google(modelId)
  }

  // OpenAI and OpenAI-compatible providers (groq, together, perplexity, deepseek, mistral, azure, custom)
  const resolvedBaseUrl = baseUrl || PROVIDER_BASE_URLS[provider]
  const openai = createOpenAI({
    apiKey,
    ...(resolvedBaseUrl ? { baseURL: resolvedBaseUrl } : {}),
  })
  return openai(modelId)
}

export async function POST(req: Request) {
  try {
    const { message, chatHistory, apiKey, provider, model, baseUrl } = await req.json()

    if (!apiKey || !provider) {
      return new Response(
        JSON.stringify({ error: "No API key configured. Please add an API key in your Profile settings." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Create context from chat history
    const messages = chatHistory.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }))

    const aiModel = createModel(provider, apiKey, model, baseUrl)

    const result = await streamText({
      model: aiModel,
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
    console.error("AI API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
