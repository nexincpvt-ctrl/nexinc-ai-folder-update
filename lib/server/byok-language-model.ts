import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'
import type { ByokProvider } from '@/lib/byok/types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export function createByokLanguageModel(
  provider: ByokProvider,
  apiKey: string,
  apiModelId: string,
): LanguageModel {
  const key = apiKey.trim()
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: key })
      return openai(apiModelId)
    }
    case 'openrouter': {
      const or = createOpenAI({
        apiKey: key,
        baseURL: OPENROUTER_BASE,
        headers: {
          'HTTP-Referer':
            process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://nexinc.local',
          'X-Title': 'Nexinc AI',
        },
      })
      return or(apiModelId)
    }
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey: key })
      return google(apiModelId)
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey: key })
      return anthropic(apiModelId)
    }
    default: {
      const _exhaustive: never = provider
      return _exhaustive
    }
  }
}
