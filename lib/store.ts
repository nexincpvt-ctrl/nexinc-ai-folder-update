'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, defaultSettings, Chat, Attachment } from './types'
import { DEFAULT_MODEL_ID } from '@/lib/byok/model-catalog'
import type { ByokProvider } from '@/lib/byok/types'
import { catalogForProvider } from '@/lib/byok/model-catalog'

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  addChat: (chat: Chat) => void
  updateChat: (id: string, updates: Partial<Chat>) => void
  deleteChat: (id: string) => void
  setCurrentChat: (id: string | null) => void
  getCurrentChat: () => Chat | undefined
  clearAllChats: () => void

  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void

  sidebarOpen: boolean
  settingsOpen: boolean
  modelSelectorOpen: boolean
  attachmentPreviewOpen: boolean
  currentAttachment: Attachment | null
  setSidebarOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setModelSelectorOpen: (open: boolean) => void
  setAttachmentPreview: (attachment: Attachment | null) => void

  selectedModel: string
  setSelectedModel: (model: string) => void

  activeProvider: ByokProvider | 'all'
  setActiveProvider: (provider: ByokProvider | 'all') => void

  /** Returns catalog entries for the sidebar / model UI */
  getAvailableModels: () => ReturnType<typeof catalogForProvider>
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),
      updateChat: (id, updates) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c,
          ),
        })),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          currentChatId: state.currentChatId === id ? null : state.currentChatId,
        })),
      setCurrentChat: (id) => set({ currentChatId: id }),
      getCurrentChat: () => get().chats.find((c) => c.id === get().currentChatId),
      clearAllChats: () => set({ chats: [], currentChatId: null }),

      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      resetSettings: () => set({ settings: defaultSettings }),

      sidebarOpen: true,
      settingsOpen: false,
      modelSelectorOpen: false,
      attachmentPreviewOpen: false,
      currentAttachment: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setModelSelectorOpen: (open) => set({ modelSelectorOpen: open }),
      setAttachmentPreview: (attachment) =>
        set({
          currentAttachment: attachment,
          attachmentPreviewOpen: !!attachment,
        }),

      selectedModel: DEFAULT_MODEL_ID,
      setSelectedModel: (model) =>
        set((state) => {
          const cfg = catalogForProvider('all').find((m) => m.id === model)
          const nextLast = cfg?.provider ?? state.settings.lastByokProvider
          return {
            selectedModel: model,
            settings: {
              ...state.settings,
              lastByokProvider: nextLast,
            },
          }
        }),

      activeProvider: 'all',
      setActiveProvider: (provider) => set({ activeProvider: provider }),

      getAvailableModels: () =>
        catalogForProvider(
          get().activeProvider === 'all'
            ? 'all'
            : (get().activeProvider as ByokProvider),
        ),
    }),
    {
      name: 'nexinc-storage-v3',
      partialize: (state) => ({
        chats: state.chats,
        settings: state.settings,
        selectedModel: state.selectedModel,
        activeProvider: state.activeProvider,
      }),
    },
  ),
)
