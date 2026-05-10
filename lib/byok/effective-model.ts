import type { ByokProvider } from './types'
import {
  OPENROUTER_CUSTOM_MODEL_ID,
  getCatalogModel,
} from '@/lib/byok/model-catalog'

export function resolveEffectiveModel(
  selectedModelId: string,
  settings: Pick<import('@/lib/types').Settings, 'customOpenRouterModelId'>,
): { provider: ByokProvider; apiModelId: string } | null {
  if (selectedModelId === OPENROUTER_CUSTOM_MODEL_ID) {
    const slug = settings.customOpenRouterModelId.trim()
    if (!slug) return null
    return { provider: 'openrouter', apiModelId: slug }
  }
  const c = getCatalogModel(selectedModelId)
  if (!c || !c.apiModelId) return null
  return { provider: c.provider, apiModelId: c.apiModelId }
}
