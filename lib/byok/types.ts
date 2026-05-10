export type ByokProvider = 'openai' | 'gemini' | 'openrouter' | 'anthropic'

export interface CatalogModelEntry {
  id: string
  label: string
  provider: ByokProvider
  apiModelId: string
  description: string
  tier: 'fast' | 'balanced' | 'max'
}

export const BYOK_PROVIDER_LABELS: Record<ByokProvider, string> = {
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
}
