'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, defaultSettings, Chat, Attachment, APIProvider, getModelsByProvider } from './types'

interface ChatStore {
  // Chats
  chats: Chat[]
  currentChatId: string | null
  addChat: (chat: Chat) => void
  updateChat: (id: string, updates: Partial<Chat>) => void
  deleteChat: (id: string) => void
  setCurrentChat: (id: string | null) => void
  getCurrentChat: () => Chat | undefined
  clearAllChats: () => void

  // Settings
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
  
  // UI State
  sidebarOpen: boolean
  settingsOpen: boolean
  modelSelectorOpen: boolean
  attachmentPreviewOpen: boolean
  currentAttachment: Attachment | null
  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setModelSelectorOpen: (open: boolean) => void
  setAttachmentPreview: (attachment: Attachment | null) => void

  // Selected model
  selectedModel: string
  setSelectedModel: (model: string) => void

  // Active provider filter
  activeProvider: APIProvider | 'all'
  setActiveProvider: (provider: APIProvider | 'all') => void
  
  // API Key management
  setApiKey: (provider: APIProvider, apiKey: string) => void
  getApiKey: (provider: APIProvider) => string
  isProviderEnabled: (provider: APIProvider) => boolean
  toggleProvider: (provider: APIProvider, enabled: boolean) => void

  // Get available models based on enabled providers
  getAvailableModels: () => ReturnType<typeof getModelsByProvider>
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Chats
      chats: [],
      currentChatId: null,
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c)),
        })),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          currentChatId: state.currentChatId === id ? null : state.currentChatId,
        })),
      setCurrentChat: (id) => set({ currentChatId: id }),
      getCurrentChat: () => {
        const state = get()
        return state.chats.find((c) => c.id === state.currentChatId)
      },
      clearAllChats: () => set({ chats: [], currentChatId: null }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      resetSettings: () => set({ settings: defaultSettings }),

      // UI State
      sidebarOpen: true,
      settingsOpen: false,
      modelSelectorOpen: false,
      attachmentPreviewOpen: false,
      currentAttachment: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setModelSelectorOpen: (open) => set({ modelSelectorOpen: open }),
      setAttachmentPreview: (attachment) =>
        set({ currentAttachment: attachment, attachmentPreviewOpen: !!attachment }),

      // Selected model
      selectedModel: 'nexinc-pro-3.5',
      setSelectedModel: (model) => set({ selectedModel: model }),

      // Active provider filter
      activeProvider: 'all',
      setActiveProvider: (provider) => set({ activeProvider: provider }),

      // API Key management
      setApiKey: (provider, apiKey) =>
        set((state) => ({
          settings: {
            ...state.settings,
            apiConfigs: state.settings.apiConfigs.map((c) =>
              c.provider === provider ? { ...c, apiKey, enabled: apiKey.length > 0 } : c
            ),
          },
        })),
      getApiKey: (provider) => {
        const config = get().settings.apiConfigs.find((c) => c.provider === provider)
        return config?.apiKey || ''
      },
      isProviderEnabled: (provider) => {
        const config = get().settings.apiConfigs.find((c) => c.provider === provider)
        return config?.enabled || false
      },
      toggleProvider: (provider, enabled) =>
        set((state) => ({
          settings: {
            ...state.settings,
            apiConfigs: state.settings.apiConfigs.map((c) =>
              c.provider === provider ? { ...c, enabled } : c
            ),
          },
        })),

      // Get available models
      getAvailableModels: () => {
        const state = get()
        const enabledProviders = state.settings.apiConfigs
          .filter((c) => c.enabled)
          .map((c) => c.provider)
        
        // Always include models (using Vercel AI Gateway)
        return getModelsByProvider(state.activeProvider === 'all' ? 'openai' : state.activeProvider)
      },
    }),
    {
      name: 'nexinc-storage',
      partialize: (state) => ({
        chats: state.chats,
        settings: state.settings,
        selectedModel: state.selectedModel,
      }),
    }
  )
)
