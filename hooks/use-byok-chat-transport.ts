'use client'

import { useMemo } from 'react'
import { DefaultChatTransport } from 'ai'
import { loadProviderKey } from '@/lib/byok/crypto'
import { resolveEffectiveModel } from '@/lib/byok/effective-model'

const HEADER_PROVIDER = 'x-byok-provider'
const HEADER_API_KEY = 'x-byok-key'

export type ByokTransportOptions = {
  selectedModelId: string
  systemPrompt: string
  temperature: number
  maxOutputTokens: number
  customOpenRouterModelId: string
}

export function useByokChatTransport(o: ByokTransportOptions) {
  return useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: async ({ messages, headers }) => {
          const resolved = resolveEffectiveModel(o.selectedModelId, {
            customOpenRouterModelId: o.customOpenRouterModelId,
          })
          if (!resolved) {
            throw new Error(
              'Select a catalog model or set an OpenRouter slug in Settings.',
            )
          }
          const apiKey = await loadProviderKey(resolved.provider)
          if (!apiKey) {
            const providerName = resolved.provider.toUpperCase()
            throw new Error(
              `The selected model requires an ${providerName} API key. Please add it in Settings or switch to a different model.`,
            )
          }
          const h = new Headers(headers ?? undefined)
          h.set(HEADER_PROVIDER, resolved.provider)
          h.set(HEADER_API_KEY, apiKey)
          return {
            headers: h,
            body: {
              messages,
              apiModelId: resolved.apiModelId,
              systemPrompt: o.systemPrompt,
              temperature: o.temperature,
              maxOutputTokens: o.maxOutputTokens,
            },
          }
        },
      }),
    [
      o.selectedModelId,
      o.systemPrompt,
      o.temperature,
      o.maxOutputTokens,
      o.customOpenRouterModelId,
    ],
  )
}
