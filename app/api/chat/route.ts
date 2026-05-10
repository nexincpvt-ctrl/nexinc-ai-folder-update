import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { getModelById } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, modelId, systemPrompt, temperature, maxTokens } = await req.json() as {
      messages: UIMessage[]
      modelId: string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
    }

    const modelConfig = getModelById(modelId)
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: 'Invalid model' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = streamText({
      model: modelConfig.actualModel,
      system: systemPrompt || 'You are Nexinc, a helpful AI assistant. Be concise, accurate, and helpful. Use markdown formatting for code blocks, lists, and emphasis when appropriate.',
      messages: await convertToModelMessages(messages),
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
      abortSignal: req.signal,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
