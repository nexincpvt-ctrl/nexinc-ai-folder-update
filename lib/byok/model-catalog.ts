import type { CatalogModelEntry, ByokProvider } from './types'

export const OPENROUTER_CUSTOM_MODEL_ID = 'preset-openrouter-user-slug'

export const DEFAULT_MODEL_ID = 'preset-openai-gpt-4o'

/** Curated presets; apiModelId is the exact identifier each provider REST API expects for OpenRouter. */
export const MODEL_CATALOG: CatalogModelEntry[] = [
  /* OpenAI */
  {
    id: 'preset-openai-gpt-4o',
    label: 'GPT‑4o',
    provider: 'openai',
    apiModelId: 'gpt-4o',
    description: 'Flagship multimodal model',
    tier: 'max',
  },
  {
    id: 'preset-openai-gpt-4o-mini',
    label: 'GPT‑4o mini',
    provider: 'openai',
    apiModelId: 'gpt-4o-mini',
    description: 'Fast inexpensive general model',
    tier: 'fast',
  },
  {
    id: 'preset-openai-gpt-4-turbo',
    label: 'GPT‑4 Turbo',
    provider: 'openai',
    apiModelId: 'gpt-4-turbo',
    description: '128k context general model',
    tier: 'balanced',
  },
  {
    id: 'preset-openai-gpt-35-turbo',
    label: 'GPT‑3.5 Turbo',
    provider: 'openai',
    apiModelId: 'gpt-3.5-turbo',
    description: 'Fast legacy chat model',
    tier: 'fast',
  },
  /* Gemini (@ai-sdk/google) */
  {
    id: 'preset-gemini-2-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    apiModelId: 'gemini-2.0-flash',
    description: 'Low-latency Google multimodal',
    tier: 'fast',
  },
  {
    id: 'preset-gemini-15-pro',
    label: 'Gemini 1.5 Pro',
    provider: 'gemini',
    apiModelId: 'gemini-1.5-pro',
    description: 'Long-context Google model',
    tier: 'max',
  },
  {
    id: 'preset-gemini-15-flash',
    label: 'Gemini 1.5 Flash',
    provider: 'gemini',
    apiModelId: 'gemini-1.5-flash',
    description: 'Efficient Gemini for speed',
    tier: 'balanced',
  },
  /* Anthropic */
  {
    id: 'preset-anthropic-claude-sonnet-4',
    label: 'Claude Sonnet 4',
    provider: 'anthropic',
    apiModelId: 'claude-sonnet-4-20250514',
    description: 'Balanced Claude 4',
    tier: 'balanced',
  },
  {
    id: 'preset-anthropic-claude-opus-4',
    label: 'Claude Opus 4',
    provider: 'anthropic',
    apiModelId: 'claude-opus-4-20250514',
    description: 'Most capable Claude 4',
    tier: 'max',
  },
  {
    id: 'preset-anthropic-claude-35-haiku',
    label: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    apiModelId: 'claude-3-5-haiku-20241022',
    description: 'Fast Claude',
    tier: 'fast',
  },
  /* OpenRouter (public slugs) */
  {
    id: 'preset-or-gpt-4o',
    label: 'OpenRouter — openai/gpt-4o',
    provider: 'openrouter',
    apiModelId: 'openai/gpt-4o',
    description: 'Hosted GPT‑4o via OpenRouter',
    tier: 'max',
  },
  {
    id: 'preset-or-claude-35-sonnet',
    label: 'OpenRouter — anthropic/claude-3.5-sonnet',
    provider: 'openrouter',
    apiModelId: 'anthropic/claude-3.5-sonnet',
    description: 'Claude 3.5 Sonnet multi-vendor',
    tier: 'balanced',
  },
  {
    id: 'preset-or-gemini-flash',
    label: 'OpenRouter — google/gemini-2.0-flash-001',
    provider: 'openrouter',
    apiModelId: 'google/gemini-2.0-flash-001',
    description: 'Gemini Flash on OpenRouter',
    tier: 'fast',
  },
  {
    id: 'preset-or-qwen-32b',
    label: 'OpenRouter — qwen/qwen-2.5-32b-instruct',
    provider: 'openrouter',
    apiModelId: 'qwen/qwen-2.5-32b-instruct',
    description: 'Open weights instruct model',
    tier: 'fast',
  },
  {
    id: OPENROUTER_CUSTOM_MODEL_ID,
    label: 'OpenRouter — your model slug',
    provider: 'openrouter',
    apiModelId: '',
    description: 'Set the exact slug in Settings → Connections',
    tier: 'balanced',
  },
]

export function catalogForProvider(p: ByokProvider | 'all'): CatalogModelEntry[] {
  if (p === 'all') return MODEL_CATALOG
  return MODEL_CATALOG.filter((m) => m.provider === p)
}

export function getCatalogModel(id: string): CatalogModelEntry | undefined {
  return MODEL_CATALOG.find((m) => m.id === id)
}
