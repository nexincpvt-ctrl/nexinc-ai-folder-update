import type { ByokProvider } from '@/lib/byok/types'

/** @deprecated Prefer ByokProvider from lib/byok/types */
export type LegacyProviderAlias = ByokProvider

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
  systemPrompt: string
  temperature: number
  maxOutputTokens: number
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
  /** Preferred provider for model picker filtering */
  lastByokProvider: ByokProvider
  /** Legacy: custom OpenRouter model slug when advanced mode picks a free-text model */
  customOpenRouterModelId: string
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
  systemPrompt:
    'You are Nexinc, a helpful AI assistant. Be concise, accurate, and helpful.',
  temperature: 0.7,
  maxOutputTokens: 4096,
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
  lastByokProvider: 'openai',
  customOpenRouterModelId: '',
}
