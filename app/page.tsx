'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { useChat } from '@ai-sdk/react'
import { toast } from 'sonner'
import type { UIMessage } from 'ai'
import { useTheme } from 'next-themes'
import { Sidebar } from '@/components/sidebar'
import { ChatArea } from '@/components/chat-area'
import { InputArea } from '@/components/input-area'
import { ModelSelector } from '@/components/model-selector'
import { SettingsDialog } from '@/components/settings-dialog'
import { useChatStore } from '@/lib/store'
import { Attachment } from '@/lib/types'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useByokChatTransport } from '@/hooks/use-byok-chat-transport'
import { resolveEffectiveModel } from '@/lib/byok/effective-model'
import { getCatalogModel } from '@/lib/byok/model-catalog'
import { chatToMarkdownExport } from '@/lib/export-chat'
import { BYOK_PROVIDER_LABELS } from '@/lib/byok/types'

function generateId() {
  return crypto.randomUUID()
}

function generateTitle(content: string): string {
  const words = content.split(' ').slice(0, 6).join(' ')
  return words.length > 40 ? `${words.slice(0, 40)}…` : words || 'New Chat'
}

export default function HomePage() {
  const [input, setInput] = useState('')
  const ephemeralDraftIdRef = useRef(generateId())
  const prevHydratedChatIdRef = useRef<string | null>(null)

  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  const {
    chats,
    currentChatId,
    setCurrentChat,
    addChat,
    updateChat,
    selectedModel,
    setSelectedModel,
    settings,
    sidebarOpen,
    setSidebarOpen,
  } = useChatStore()

  const { setTheme } = useTheme()

  useEffect(() => {
    if (hasHydrated) {
      setTheme(settings.theme)
    }
  }, [settings.theme, setTheme, hasHydrated])

  const transport = useByokChatTransport({
    selectedModelId: selectedModel,
    systemPrompt: settings.systemPrompt,
    temperature: settings.temperature,
    maxOutputTokens: settings.maxOutputTokens,
    customOpenRouterModelId: settings.customOpenRouterModelId,
    localModelBaseUrl: settings.localModelBaseUrl,
    localModelId: settings.localModelId,
  })

  const useChatSessionId = currentChatId ?? ephemeralDraftIdRef.current

  const { messages, sendMessage, status, setMessages, stop, error, clearError, regenerate } =
    useChat({
      id: useChatSessionId,
      transport,
      onError: (err) => {
        toast.error(err.message ?? 'Request failed.')
      },
    })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (!hasHydrated) return
    const prevId = prevHydratedChatIdRef.current
    const switchedView = prevId !== currentChatId
    prevHydratedChatIdRef.current = currentChatId

    if (!currentChatId) {
      setMessages([])
      return
    }

    const chat = chats.find((c) => c.id === currentChatId)
    if (!chat) return

    if (switchedView && chat.model && chat.model !== selectedModel) {
      setSelectedModel(chat.model)
    }

    if (!switchedView) return

    if (chat.messages.length === 0) {
      const keepOptimisticDraft = prevId === null && messages.length > 0
      if (!keepOptimisticDraft) setMessages([])
      return
    }

    const uiMessages = chat.messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: m.content }],
      createdAt: m.createdAt,
    }))
    setMessages(uiMessages as UIMessage[])
  }, [currentChatId, chats, messages.length, setMessages])

  useEffect(() => {
    if (!currentChatId || messages.length === 0 || isLoading) return
    const storedMessages = messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      content:
        m.parts
          ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map((p) => p.text)
          .join('') ?? '',
      createdAt: (m as { createdAt?: Date }).createdAt ?? new Date(),
    }))
    updateChat(currentChatId, { messages: storedMessages })
  }, [messages, currentChatId, updateChat])

  const handleNewChat = useCallback(() => {
    ephemeralDraftIdRef.current = generateId()
    prevHydratedChatIdRef.current = null
    clearError()
    setCurrentChat(null)
    setMessages([])
    setInput('')
    toast.success('Started a new workspace draft.')
  }, [setCurrentChat, setMessages, clearError])

  const handleSelectChat = useCallback(
    (id: string) => {
      clearError()
      setCurrentChat(id)
    },
    [setCurrentChat, clearError],
  )

  const handleSend = useCallback(
    async (attachments?: Attachment[]) => {
      if (!input.trim() && !attachments?.length) return

      const resolved = resolveEffectiveModel(selectedModel, {
        customOpenRouterModelId: settings.customOpenRouterModelId,
      })

      // DEBUG: Log model resolution
      console.log('[DEBUG] Model Selection:', {
        uiSelected: selectedModel,
        resolvedProvider: resolved?.provider,
        resolvedApiModel: resolved?.apiModelId
      })

      if (!resolved) {
        toast.error('Please select a model in the selector.')
        return
      }
      
      const { loadProviderKey } = await import('@/lib/byok/crypto')
      
      // Try to load the key for the effective provider
      let apiKey = await loadProviderKey(resolved.provider)
      let requiredProvider = resolved.provider

      // ABSOLUTE BYPASS: No keys required for Nexinc Local or LM Studio
      if (resolved.provider === 'lmstudio' || resolved.provider === 'nexinc-local') {
        apiKey = 'lm-studio-bypass'
      }

      if (!apiKey) {
        const providerName = BYOK_PROVIDER_LABELS[requiredProvider] || requiredProvider.toUpperCase()
        const modelName = getCatalogModel(selectedModel)?.label || selectedModel
        toast.error(`The selected model (${modelName}) requires an ${providerName} API key. Please add it in Settings.`)
        return
      }

      clearError()

      const sessionId = currentChatId ?? ephemeralDraftIdRef.current
      const alreadySaved = chats.some((c) => c.id === sessionId)

      if (!alreadySaved) {
        addChat({
          id: sessionId,
          title: generateTitle(input),
          messages: [],
          model: selectedModel,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        setCurrentChat(sessionId)
      }

      let messageContent = input

      if (attachments?.length) {
        const attachmentTexts = attachments
          .filter((a) => a.content)
          .map((a) => `[${a.type.toUpperCase()}: ${a.name}]\n${a.content}`)
          .join('\n\n')

        if (attachmentTexts) {
          messageContent = `${attachmentTexts}\n\n${input}`
        }
      }

      setInput('')

      const messageParts: any[] = [{ type: 'text', text: input }]

      if (attachments?.length) {
        for (const a of attachments) {
          if (a.type === 'image' && a.url) {
            messageParts.push({
              type: 'image',
              image: a.url, // Base64 or URL
            })
          } else if (a.content) {
            // For documents, we still append to text or use a file part if the model supports it
            // For simplicity and maximum compatibility, we'll keep the text injection for docs
            messageParts[0].text += `\n\n[FILE: ${a.name}]\n${a.content}`
          }
        }
      }

      sendMessage({
        text: input, // Still used for internal state maybe
        files: attachments?.map(a => ({
          name: a.name,
          url: a.url || '',
          type: 'file',
          mediaType: a.type === 'image' ? 'image/jpeg' : 
                     a.type === 'pdf' ? 'application/pdf' : 'text/plain',
        }))
      })
    },
    [
      input,
      currentChatId,
      chats,
      selectedModel,
      settings,
      addChat,
      setCurrentChat,
      sendMessage,
      clearError,
    ],
  )

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [])

  const handleRegenerateAssistant = useCallback(
    async (assistantMessageId: string | undefined) => {
      clearError()
      try {
        if (assistantMessageId) await regenerate({ messageId: assistantMessageId })
        else await regenerate()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Regenerate failed')
      }
    },
    [clearError, regenerate],
  )

  const handleEditUserMessage = useCallback(
    async (messageId: string, newText: string) => {
      const trimmed = newText.trim()
      if (!trimmed) return
      clearError()
      flushSync(() => {
        setMessages((prev) => {
          const i = prev.findIndex((m) => m.id === messageId)
          if (i < 0) return prev
          const clone = [...prev]
          const base = clone[i]
          clone[i] = {
            ...base,
            parts: [{ type: 'text', text: trimmed }],
          } as UIMessage
          return clone.slice(0, i + 1)
        })
      })
      await regenerate({ messageId })
    },
    [clearError, regenerate, setMessages],
  )

  const handleClearCurrentChat = useCallback(() => {
    if (!currentChatId) return
    setMessages([])
    updateChat(currentChatId, { messages: [] })
    toast.message('Conversation cleared.')
  }, [currentChatId, setMessages, updateChat])

  const exportChatFile = useCallback(
    (id: string) => {
      const chat = chats.find((c) => c.id === id)
      if (!chat) return
      const blob = new Blob([chatToMarkdownExport(chat)], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${chat.title.slice(0, 48).replace(/[/\\?%*:|"<>]/g, '-') || 'chat'}.md`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported markdown transcript.')
    },
    [chats],
  )

  if (!hasHydrated) {
    return (
      <div className="nexinc-shell-bg flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl animate-pulse">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium animate-pulse opacity-50">Initializing Nexinc...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="nexinc-shell-bg flex h-screen overflow-x-auto overflow-y-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(from_var(--primary)_l_c_h_/_0.14),_transparent_55%)]" />

      <div
        className={cn(
          'relative shrink-0 z-10 backdrop-blur-sm transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-14',
        )}
      >
        <Sidebar
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onClearCurrentMessages={handleClearCurrentChat}
          onExportChat={exportChatFile}
        />
      </div>

      <main className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden backdrop-blur-[2px]">
        <header className="nexinc-glass-soft flex md:hidden items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Nexinc</span>
          </div>
          <div className="w-9" />
        </header>

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          error={error}
          markdownEnabled={settings.enableMarkdown}
          onSuggestionClick={handleSuggestionClick}
          onRegenerate={handleRegenerateAssistant}
          onEditUserMessage={handleEditUserMessage}
        />

        <div className="px-4 pb-safe">
          <InputArea
            value={input}
            onChange={setInput}
            onSend={(atts) => void handleSend(atts)}
            onStop={stop}
            isLoading={isLoading}
          />
        </div>
      </main>

      <ModelSelector />
      <SettingsDialog />
    </div>
  )
}
