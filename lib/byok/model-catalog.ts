import type { CatalogModelEntry, ByokProvider } from './types'

export const OPENROUTER_CUSTOM_MODEL_ID = 'preset-openrouter-user-slug'


export const DEFAULT_MODEL_ID = 'nexinc-intelligence-v1'

/** Curated presets; apiModelId is the exact identifier each provider REST API expects for OpenRouter. */
export const MODEL_CATALOG: CatalogModelEntry[] = [
  /* Nexinc Models (Branded) */
  {
    id: 'nexinc-intelligence-v1',
    label: 'Nexinc Intelligence',
    provider: 'nexinc-local',
    apiModelId: 'meta-llama-3.1-8b-instruct',
    description: 'High-performance reasoning powered by Nexinc Local Core',
    tier: 'max',
  },
  {
    id: 'nexinc-speed-v1',
    label: 'Nexinc Speed',
    provider: 'nexinc-local',
    apiModelId: 'meta-llama-3.1-8b-instruct',
    description: 'Ultra-fast responses for daily tasks',
    tier: 'fast',
  },
  {
    id: 'nexinc-creative-v1',
    label: 'Nexinc Creative',
    provider: 'nexinc',
    apiModelId: 'anthropic/claude-3.5-sonnet',
    description: 'Superior writing and creative capabilities',
    tier: 'balanced',
  },
  {
    id: 'nexinc-vision-v1',
    label: 'Nexinc Vision',
    provider: 'nexinc',
    apiModelId: 'openai/gpt-4o',
    description: 'Advanced multimodal capabilities for image analysis',
    tier: 'max',
  },
  /* OpenAI (Official) */
  {
    id: 'preset-openai-gpt-4o',
    label: 'Official GPT‑4o',
    provider: 'openai',
    apiModelId: 'gpt-4o',
    description: 'Direct OpenAI access to flagship model',
    tier: 'max',
  },
  {
    id: 'preset-openai-gpt-4o-mini',
    label: 'Official GPT‑4o mini',
    provider: 'openai',
    apiModelId: 'gpt-4o-mini',
    description: 'Fast inexpensive general model',
    tier: 'fast',
  },
  {
    id: 'preset-openai-gpt-4-turbo',
    label: 'Official GPT‑4 Turbo',
    provider: 'openai',
    apiModelId: 'gpt-4-turbo',
    description: '128k context general model',
    tier: 'balanced',
  },
  {
    id: 'preset-openai-gpt-35-turbo',
    label: 'Official GPT‑3.5 Turbo',
    provider: 'openai',
    apiModelId: 'gpt-3.5-turbo',
    description: 'Fast legacy chat model',
    tier: 'fast',
  },
  /* Gemini (Official) */
  {
    id: 'preset-gemini-2-flash',
    label: 'Official Gemini 2.0 Flash',
    provider: 'gemini',
    apiModelId: 'gemini-2.0-flash',
    description: 'Low-latency Google multimodal',
    tier: 'fast',
  },
  {
    id: 'preset-gemini-15-pro',
    label: 'Official Gemini 1.5 Pro',
    provider: 'gemini',
    apiModelId: 'gemini-1.5-pro',
    description: 'Long-context Google model',
    tier: 'max',
  },
  {
    id: 'preset-gemini-15-flash',
    label: 'Official Gemini 1.5 Flash',
    provider: 'gemini',
    apiModelId: 'gemini-1.5-flash',
    description: 'Efficient Gemini for speed',
    tier: 'balanced',
  },
  /* Anthropic (Official) */
  {
    id: 'preset-anthropic-claude-sonnet-4',
    label: 'Official Claude Sonnet 4',
    provider: 'anthropic',
    apiModelId: 'claude-sonnet-4-20250514',
    description: 'Balanced Claude 4',
    tier: 'balanced',
  },
  {
    id: 'preset-anthropic-claude-opus-4',
    label: 'Official Claude Opus 4',
    provider: 'anthropic',
    apiModelId: 'claude-opus-4-20250514',
    description: 'Most capable Claude 4',
    tier: 'max',
  },
  {
    id: 'preset-anthropic-claude-35-haiku',
    label: 'Official Claude 3.5 Haiku',
    provider: 'anthropic',
    apiModelId: 'claude-3-5-haiku-20241022',
    description: 'Fast Claude',
    tier: 'fast',
  },
  /* OpenRouter (Official) */
  {
    id: 'preset-or-gemini-2-flash-lite-free',
    label: 'OpenRouter — Gemini 2.0 Flash Lite (FREE)',
    provider: 'openrouter',
    apiModelId: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    description: 'Fast, free experimental Gemini model',
    tier: 'fast',
  },
  {
    id: 'preset-or-mistral-7b-free',
    label: 'OpenRouter — Mistral 7B (FREE)',
    provider: 'openrouter',
    apiModelId: 'mistralai/mistral-7b-instruct:free',
    description: 'Highly capable open-source model',
    tier: 'balanced',
  },
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
  /* xAI (Official) */
  {
    id: 'preset-xai-grok-2',
    label: 'Grok-2',
    provider: 'xai',
    apiModelId: 'grok-2-1212',
    description: 'State-of-the-art Grok with enhanced reasoning',
    tier: 'max',
  },
  {
    id: 'preset-xai-grok-beta',
    label: 'Grok-beta',
    provider: 'xai',
    apiModelId: 'grok-beta',
    description: 'Latest Grok experimental model',
    tier: 'balanced',
  },
  /* LM Studio Local Models */
  {
    id: 'preset-lmstudio-llama-3.1-8b',
    label: 'Llama 3.1 8B (Local)',
    provider: 'lmstudio',
    apiModelId: 'llama-3.1-8b',
    description: 'Meta\'s high-performance 8B model running locally',
    tier: 'balanced',
  },
  {
    id: 'preset-lmstudio-qwen2.5-coder-7b',
    label: 'Qwen 2.5 Coder 7B (Local)',
    provider: 'lmstudio',
    apiModelId: 'qwen2.5-coder-7b',
    description: 'Alibaba\'s advanced coding model running locally',
    tier: 'balanced',
  },
  {
    id: 'preset-lmstudio-deepseek-r1-qwen-7b',
    label: 'DeepSeek R1 Qwen 7B (Local)',
    provider: 'lmstudio',
    apiModelId: 'deepseek-r1-distill-qwen-7b',
    description: 'DeepSeek\'s reasoning model distilled to Qwen architecture',
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
