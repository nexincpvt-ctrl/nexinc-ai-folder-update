export type APIProvider = 'openai' | 'anthropic' | 'google' | 'groq' | 'xai'

export interface ModelConfig {
  id: string
  nexincName: string
  actualModel: string
  provider: APIProvider
  description: string
  contextWindow: number
  maxOutput: number
  capabilities: ('text' | 'image' | 'pdf' | 'code' | 'reasoning')[]
  speed: 'fast' | 'medium' | 'slow'
  quality: 'standard' | 'high' | 'premium'
}

export interface APIConfig {
  provider: APIProvider
  apiKey: string
  enabled: boolean
  name: string
  icon: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  attachments?: Attachment[]
  createdAt: Date
}

export interface Attachment {
  id: string
  type: 'image' | 'pdf' | 'document'
  name: string
  url: string
  content?: string
  size: number
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  sendWithEnter: boolean
  showCodeLineNumbers: boolean
  enableMarkdown: boolean
  enableLatex: boolean
  autoSaveChats: boolean
  streamResponses: boolean
  defaultModel: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  enableWebSearch: boolean
  enableMemory: boolean
  language: string
  showTimestamps: boolean
  compactMode: boolean
  enableSounds: boolean
  notificationsEnabled: boolean
  autoScroll: boolean
  codeTheme: 'github' | 'dracula' | 'monokai' | 'nord' | 'oneDark'
  apiConfigs: APIConfig[]
}

export const defaultSettings: Settings = {
  theme: 'system',
  fontSize: 'medium',
  sendWithEnter: true,
  showCodeLineNumbers: true,
  enableMarkdown: true,
  enableLatex: true,
  autoSaveChats: true,
  streamResponses: true,
  defaultModel: 'nexinc-pro-3.5',
  systemPrompt: 'You are Nexinc, a helpful AI assistant. Be concise, accurate, and helpful.',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  enableWebSearch: false,
  enableMemory: true,
  language: 'en',
  showTimestamps: false,
  compactMode: false,
  enableSounds: false,
  notificationsEnabled: true,
  autoScroll: true,
  codeTheme: 'oneDark',
  apiConfigs: [
    { provider: 'openai', apiKey: '', enabled: false, name: 'OpenAI', icon: '🟢' },
    { provider: 'anthropic', apiKey: '', enabled: false, name: 'Anthropic', icon: '🟠' },
    { provider: 'google', apiKey: '', enabled: false, name: 'Google AI', icon: '🔵' },
    { provider: 'groq', apiKey: '', enabled: false, name: 'Groq', icon: '⚡' },
    { provider: 'xai', apiKey: '', enabled: false, name: 'xAI', icon: '✖️' },
  ],
}

// Model configurations with Nexinc branding
export const modelConfigs: ModelConfig[] = [
  // OpenAI models
  {
    id: 'nexinc-pro-3.5',
    nexincName: 'Nexinc Pro 3.5',
    actualModel: 'openai/gpt-4o',
    provider: 'openai',
    description: 'Most capable model for complex tasks',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'image', 'pdf', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  {
    id: 'nexinc-pro-3.5-mini',
    nexincName: 'Nexinc Pro 3.5 Mini',
    actualModel: 'openai/gpt-4o-mini',
    provider: 'openai',
    description: 'Fast and efficient for everyday tasks',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'image', 'code'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-ultra',
    nexincName: 'Nexinc Ultra',
    actualModel: 'openai/gpt-5',
    provider: 'openai',
    description: 'Next-gen reasoning and capabilities',
    contextWindow: 200000,
    maxOutput: 32768,
    capabilities: ['text', 'image', 'pdf', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  {
    id: 'nexinc-mini',
    nexincName: 'Nexinc Mini',
    actualModel: 'openai/gpt-5-mini',
    provider: 'openai',
    description: 'Lightweight and fast responses',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-o1',
    nexincName: 'Nexinc Reasoning',
    actualModel: 'openai/o1',
    provider: 'openai',
    description: 'Advanced reasoning and problem solving',
    contextWindow: 128000,
    maxOutput: 32768,
    capabilities: ['text', 'code', 'reasoning'],
    speed: 'slow',
    quality: 'premium',
  },
  // Anthropic models
  {
    id: 'nexinc-claude-opus',
    nexincName: 'Nexinc Opus 4',
    actualModel: 'anthropic/claude-opus-4',
    provider: 'anthropic',
    description: 'Most capable Claude model',
    contextWindow: 200000,
    maxOutput: 32768,
    capabilities: ['text', 'image', 'pdf', 'code', 'reasoning'],
    speed: 'slow',
    quality: 'premium',
  },
  {
    id: 'nexinc-claude-sonnet',
    nexincName: 'Nexinc Sonnet 4',
    actualModel: 'anthropic/claude-sonnet-4',
    provider: 'anthropic',
    description: 'Balanced performance and speed',
    contextWindow: 200000,
    maxOutput: 16384,
    capabilities: ['text', 'image', 'pdf', 'code'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'nexinc-claude-haiku',
    nexincName: 'Nexinc Haiku 3.5',
    actualModel: 'anthropic/claude-3-5-haiku-latest',
    provider: 'anthropic',
    description: 'Fast and efficient responses',
    contextWindow: 200000,
    maxOutput: 8192,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-claude-35-sonnet',
    nexincName: 'Nexinc Sonnet 3.5',
    actualModel: 'anthropic/claude-3-5-sonnet-latest',
    provider: 'anthropic',
    description: 'Previous gen balanced model',
    contextWindow: 200000,
    maxOutput: 8192,
    capabilities: ['text', 'image', 'code'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'nexinc-claude-sonnet-45',
    nexincName: 'Nexinc Sonnet 4.5',
    actualModel: 'anthropic/claude-sonnet-4-5',
    provider: 'anthropic',
    description: 'Latest Sonnet with enhanced capabilities',
    contextWindow: 200000,
    maxOutput: 16384,
    capabilities: ['text', 'image', 'pdf', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  // Google models
  {
    id: 'nexinc-gemini-pro',
    nexincName: 'Nexinc Gemini Pro',
    actualModel: 'google/gemini-2.5-pro-preview',
    provider: 'google',
    description: 'Google\'s most capable model',
    contextWindow: 1000000,
    maxOutput: 65536,
    capabilities: ['text', 'image', 'pdf', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  {
    id: 'nexinc-gemini-flash',
    nexincName: 'Nexinc Gemini Flash',
    actualModel: 'google/gemini-2.5-flash-preview',
    provider: 'google',
    description: 'Fast multimodal responses',
    contextWindow: 1000000,
    maxOutput: 8192,
    capabilities: ['text', 'image', 'code'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-gemini-2-flash',
    nexincName: 'Nexinc Gemini 2 Flash',
    actualModel: 'google/gemini-2.0-flash',
    provider: 'google',
    description: 'Ultra-fast responses',
    contextWindow: 1000000,
    maxOutput: 8192,
    capabilities: ['text', 'image'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-gemini-3-flash',
    nexincName: 'Nexinc Gemini 3 Flash',
    actualModel: 'google/gemini-3-flash',
    provider: 'google',
    description: 'Latest ultra-fast model',
    contextWindow: 1000000,
    maxOutput: 16384,
    capabilities: ['text', 'image', 'code'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-gemini-think',
    nexincName: 'Nexinc Gemini Think',
    actualModel: 'google/gemini-2.5-flash-thinking-preview',
    provider: 'google',
    description: 'Enhanced reasoning capabilities',
    contextWindow: 1000000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  // Groq models
  {
    id: 'nexinc-groq-llama',
    nexincName: 'Nexinc Speed 70B',
    actualModel: 'groq/llama-3.3-70b-versatile',
    provider: 'groq',
    description: 'Ultra-fast Llama 70B',
    contextWindow: 128000,
    maxOutput: 32768,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-groq-mixtral',
    nexincName: 'Nexinc Speed Mix',
    actualModel: 'groq/mixtral-8x7b-32768',
    provider: 'groq',
    description: 'Fast mixture of experts',
    contextWindow: 32768,
    maxOutput: 8192,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-groq-llama-8b',
    nexincName: 'Nexinc Speed 8B',
    actualModel: 'groq/llama-3.1-8b-instant',
    provider: 'groq',
    description: 'Instant responses',
    contextWindow: 128000,
    maxOutput: 8192,
    capabilities: ['text'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-groq-deepseek',
    nexincName: 'Nexinc DeepSeek R1',
    actualModel: 'groq/deepseek-r1-distill-llama-70b',
    provider: 'groq',
    description: 'DeepSeek reasoning model',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'reasoning'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-groq-qwen',
    nexincName: 'Nexinc Qwen 32B',
    actualModel: 'groq/qwen-qwq-32b',
    provider: 'groq',
    description: 'Qwen reasoning model',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code', 'reasoning'],
    speed: 'fast',
    quality: 'high',
  },
  // xAI models
  {
    id: 'nexinc-grok',
    nexincName: 'Nexinc Grok 3',
    actualModel: 'xai/grok-3',
    provider: 'xai',
    description: 'xAI\'s latest Grok model',
    contextWindow: 128000,
    maxOutput: 32768,
    capabilities: ['text', 'image', 'code', 'reasoning'],
    speed: 'medium',
    quality: 'premium',
  },
  {
    id: 'nexinc-grok-mini',
    nexincName: 'Nexinc Grok Mini',
    actualModel: 'xai/grok-3-mini',
    provider: 'xai',
    description: 'Compact Grok model',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'high',
  },
  {
    id: 'nexinc-grok-fast',
    nexincName: 'Nexinc Grok Fast',
    actualModel: 'xai/grok-3-fast',
    provider: 'xai',
    description: 'Speed-optimized Grok',
    contextWindow: 128000,
    maxOutput: 16384,
    capabilities: ['text', 'code'],
    speed: 'fast',
    quality: 'standard',
  },
  {
    id: 'nexinc-grok-2',
    nexincName: 'Nexinc Grok 2',
    actualModel: 'xai/grok-2-latest',
    provider: 'xai',
    description: 'Previous generation Grok',
    contextWindow: 128000,
    maxOutput: 8192,
    capabilities: ['text', 'code'],
    speed: 'medium',
    quality: 'high',
  },
  {
    id: 'nexinc-grok-vision',
    nexincName: 'Nexinc Grok Vision',
    actualModel: 'xai/grok-2-vision-latest',
    provider: 'xai',
    description: 'Grok with vision capabilities',
    contextWindow: 128000,
    maxOutput: 8192,
    capabilities: ['text', 'image', 'code'],
    speed: 'medium',
    quality: 'high',
  },
]

export function getModelsByProvider(provider: APIProvider): ModelConfig[] {
  return modelConfigs.filter(m => m.provider === provider)
}

export function getModelById(id: string): ModelConfig | undefined {
  return modelConfigs.find(m => m.id === id)
}

export function getAllModels(): ModelConfig[] {
  return modelConfigs
}
