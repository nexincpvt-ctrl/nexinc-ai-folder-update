export type ByokProvider = 'nexinc' | 'nexinc-local' | 'openai' | 'gemini' | 'openrouter' | 'anthropic' | 'xai' | 'lmstudio'

export interface CatalogModelEntry {
  id: string
  label: string
  provider: ByokProvider
  apiModelId: string
  description: string
  tier: 'fast' | 'balanced' | 'max'
}

export const BYOK_PROVIDER_LABELS: Record<ByokProvider, string> = {
  nexinc: 'Nexinc Cloud',
  'nexinc-local': 'Nexinc AI (Local)',
  openai: 'OpenAI',
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter',
  anthropic: 'Anthropic',
  xai: 'xAI (Grok)',
  lmstudio: 'LM Studio',
}
