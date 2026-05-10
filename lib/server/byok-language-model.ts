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
  localBaseUrl?: string,
): LanguageModel {
  const key = apiKey.trim()
  switch (provider) {
    case 'lmstudio': {
      const lmstudio = createOpenAI({
        apiKey: key || 'lm-studio',
        baseURL: localBaseUrl || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
        compatibility: 'compatible', // Ensures OpenAI-compatible endpoints like LM Studio don't reject requests
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
      return lmstudio(apiModelId)
    }
    case 'nexinc-local': {
      const nexinc = createOpenAI({
        apiKey: 'nexinc-free-local',
        baseURL: 'https://scam-storewide-peroxide.ngrok-free.dev/v1',
        compatibility: 'compatible', // Fixes "invalid type for input" and forces /chat/completions format
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      })
      return nexinc(apiModelId)
    }
    case 'nexinc': {
      // Re-enable nexinc cloud if needed
      const nexinc = createOpenAI({
        apiKey: key,
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://nexinc.ai',
          'X-Title': 'Nexinc AI Official',
        },
      })
      return nexinc(apiModelId)
    }
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
    case 'xai': {
      const xai = createOpenAI({
        apiKey: key,
        baseURL: 'https://api.x.ai/v1',
      })
      return xai(apiModelId)
    }
    default: {
      const _exhaustive: never = provider
      return _exhaustive
    }
  }
}
