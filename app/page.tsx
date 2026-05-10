'use client'

import { useState, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useTheme } from 'next-themes'
import { Sidebar } from '@/components/sidebar'
import { ChatArea } from '@/components/chat-area'
import { InputArea } from '@/components/input-area'
import { ModelSelector } from '@/components/model-selector'
import { SettingsDialog } from '@/components/settings-dialog'
import { useChatStore } from '@/lib/store'
import { Attachment, Chat } from '@/lib/types'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function generateTitle(content: string): string {
  const words = content.split(' ').slice(0, 6).join(' ')
  return words.length > 40 ? words.substring(0, 40) + '...' : words || 'New Chat'
}

export default function HomePage() {
  const [input, setInput] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  
  const {
    chats,
    currentChatId,
    setCurrentChat,
    addChat,
    updateChat,
    selectedModel,
    settings,
    sidebarOpen,
    setSidebarOpen,
  } = useChatStore()

  const { setTheme } = useTheme()

  // Sync theme with settings
  useEffect(() => {
    setTheme(settings.theme)
  }, [settings.theme, setTheme])

  // Create transport for this chat
  const transport = new DefaultChatTransport({
    api: '/api/chat',
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        messages,
        modelId: selectedModel,
        systemPrompt: settings.systemPrompt,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      },
    }),
  })

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: chatId || undefined,
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Load messages when switching chats
  useEffect(() => {
    if (currentChatId && currentChatId !== chatId) {
      const chat = chats.find(c => c.id === currentChatId)
      if (chat) {
        setChatId(currentChatId)
        // Convert stored messages to UIMessage format
        const uiMessages = chat.messages.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          parts: [{ type: 'text' as const, text: m.content }],
          createdAt: m.createdAt,
        }))
        setMessages(uiMessages)
      }
    } else if (!currentChatId) {
      setChatId(null)
      setMessages([])
    }
  }, [currentChatId, chatId, chats, setMessages])

  // Save messages when they change
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const storedMessages = messages.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.parts?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text).join('') || '',
        createdAt: m.createdAt || new Date(),
      }))
      
      updateChat(chatId, { messages: storedMessages })
    }
  }, [messages, chatId, updateChat])

  const handleNewChat = useCallback(() => {
    setCurrentChat(null)
    setChatId(null)
    setMessages([])
    setInput('')
  }, [setCurrentChat, setMessages])

  const handleSelectChat = useCallback((id: string) => {
    setCurrentChat(id)
  }, [setCurrentChat])

  const handleSend = useCallback(async (attachments?: Attachment[]) => {
    if (!input.trim() && !attachments?.length) return

    let currentChatId = chatId

    // Create new chat if needed
    if (!currentChatId) {
      currentChatId = generateId()
      const newChat: Chat = {
        id: currentChatId,
        title: generateTitle(input),
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      addChat(newChat)
      setCurrentChat(currentChatId)
      setChatId(currentChatId)
    }

    // Build message with attachments
    let messageContent = input

    if (attachments?.length) {
      const attachmentTexts = attachments
        .filter(a => a.content)
        .map(a => `[${a.type.toUpperCase()}: ${a.name}]\n${a.content}`)
        .join('\n\n')
      
      if (attachmentTexts) {
        messageContent = `${attachmentTexts}\n\n${input}`
      }
    }

    setInput('')
    
    // Send message
    sendMessage({ text: messageContent })
  }, [input, chatId, selectedModel, addChat, setCurrentChat, sendMessage])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-x-auto">
      {/* Sidebar */}
      <div className={cn(
        'shrink-0 transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-14'
      )}>
        <Sidebar onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header (mobile) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Nexinc</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Chat Area */}
        <ChatArea 
          messages={messages} 
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Input Area */}
        <InputArea
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={stop}
          isLoading={isLoading}
        />
      </main>

      {/* Dialogs */}
      <ModelSelector />
      <SettingsDialog />
    </div>
  )
}
