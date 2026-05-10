import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { z } from 'zod'
import { createByokLanguageModel } from '@/lib/server/byok-language-model'
import { sanitizeChatError } from '@/lib/server/chat-http-errors'
import type { ByokProvider } from '@/lib/byok/types'

export const runtime = 'nodejs'

export const maxDuration = 120

const HEADER_PROVIDER = 'x-byok-provider'
const HEADER_API_KEY = 'x-byok-key'

const BodySchema = z.object({
  messages: z.custom<UIMessage[]>(),
  apiModelId: z.string().min(1).max(256),
  systemPrompt: z.string().max(32000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().min(256).max(128000).optional(),
})

const PROVIDERS: ByokProvider[] = ['openai', 'gemini', 'openrouter', 'anthropic']

function isProvider(v: string): v is ByokProvider {
  return (PROVIDERS as string[]).includes(v)
}

export async function POST(req: Request) {
  const providerHeader = req.headers.get(HEADER_PROVIDER)
  const apiKey = req.headers.get(HEADER_API_KEY)

  if (!providerHeader || !isProvider(providerHeader)) {
    return Response.json(
      { error: 'Missing or invalid provider header.' },
      { status: 400 },
    )
  }

  if (!apiKey || apiKey.length < 8) {
    return Response.json(
      { error: 'Missing API key. Add your key in Settings (BYOK).' },
      { status: 401 },
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    const json: unknown = await req.json()
    body = BodySchema.parse(json)
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const model = createByokLanguageModel(
      providerHeader,
      apiKey,
      body.apiModelId.trim(),
    )

    const stream = streamText({
      model,
      system:
        body.systemPrompt ||
        'You are Nexinc, a helpful assistant. Prefer markdown code fences for code.',
      messages: await convertToModelMessages(body.messages),
      temperature: body.temperature ?? 0.7,
      maxOutputTokens: body.maxOutputTokens ?? 4096,
      abortSignal: req.signal,
    })

    return stream.toUIMessageStreamResponse()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[chat] stream failed:', msg.length > 200 ? msg.slice(0, 200) : msg)
    const sanitized = sanitizeChatError(500, msg)
    return Response.json({ error: sanitized }, { status: 500 })
  }
}
