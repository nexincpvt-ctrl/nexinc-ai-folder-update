'use client'

import { useMemo, useRef, useEffect } from 'react'
import { DefaultChatTransport } from 'ai'
import { loadProviderKey } from '@/lib/byok/crypto'
import { resolveEffectiveModel } from '@/lib/byok/effective-model'
import { getCatalogModel } from '@/lib/byok/model-catalog'

const HEADER_PROVIDER = 'x-byok-provider'
const HEADER_API_KEY = 'x-byok-key'

export type ByokTransportOptions = {
  selectedModelId: string
  systemPrompt: string
  temperature: number
  maxOutputTokens: number
  customOpenRouterModelId: string
  localModelBaseUrl: string
  localModelId: string
}

export function useByokChatTransport(o: ByokTransportOptions) {
  const oRef = useRef(o)
  
  useEffect(() => {
    oRef.current = o
  }, [o])

  return useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: async ({ messages, headers }) => {
          const latestO = oRef.current
          const resolved = resolveEffectiveModel(latestO.selectedModelId, {
            customOpenRouterModelId: latestO.customOpenRouterModelId,
          })

          // DEBUG: Log transport resolution
          console.log('[DEBUG] Transport Resolution:', {
            inputModelId: latestO.selectedModelId,
            resolvedProvider: resolved?.provider,
            resolvedApiModel: resolved?.apiModelId
          })

          if (!resolved) {
            throw new Error(
              'Select a catalog model or set an OpenRouter/Local slug in Settings.',
            )
          }
          // Try to load the key for the effective provider
          let apiKey = await loadProviderKey(resolved.provider)
          let effectiveProvider = resolved.provider

          // ABSOLUTE BYPASS: No keys required for Nexinc Local or LM Studio
          if (resolved.provider === 'lmstudio' || resolved.provider === 'nexinc-local') {
            apiKey = 'lm-studio-bypass'
          }

          if (!apiKey) {
            const providerName = effectiveProvider.toUpperCase()
            const modelLabel = getCatalogModel(latestO.selectedModelId)?.label || latestO.selectedModelId
            throw new Error(
              `The selected model (${modelLabel}) requires an ${providerName} API key. Please add it in Settings.`,
            )
          }

          const h = new Headers(headers ?? undefined)
          h.set(HEADER_PROVIDER, effectiveProvider)
          h.set(HEADER_API_KEY, apiKey)
          return {
            headers: h,
            body: {
              messages,
              apiModelId: resolved.apiModelId,
              systemPrompt: latestO.systemPrompt,
              temperature: latestO.temperature,
              maxOutputTokens: latestO.maxOutputTokens,
              ...(latestO.localModelBaseUrl ? { localBaseUrl: latestO.localModelBaseUrl } : {}),
            },
          }
        },
      }),
    [], // Only initialize DefaultChatTransport once!
  )
}
