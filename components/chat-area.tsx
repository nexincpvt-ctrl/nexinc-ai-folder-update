'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store'
import { MessageBubble } from './message-bubble'
import { WelcomeScreen } from './welcome-screen'
import { Sparkles, ArrowDown, Zap } from 'lucide-react'
import type { UIMessage } from 'ai'
import { getCatalogModel } from '@/lib/byok/model-catalog'

interface ChatAreaProps {
  messages: UIMessage[]
  isLoading: boolean
  error?: Error
  markdownEnabled: boolean
  onSuggestionClick?: (suggestion: string) => void
  onRegenerate: (assistantMessageId: string | undefined) => void
  onEditUserMessage: (messageId: string, newText: string) => void
}

export function ChatArea({
  messages,
  isLoading,
  error,
  markdownEnabled,
  onSuggestionClick,
  onRegenerate,
  onEditUserMessage,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { selectedModel, settings } = useChatStore()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (settings.autoScroll) scrollToBottom()
  }, [messages, settings.autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  const modelInfo = getCatalogModel(selectedModel)
  const speedLabel =
    modelInfo?.tier === 'fast' ? 'Fast' : modelInfo?.tier === 'max' ? 'Max' : 'Balanced'

  if (messages.length === 0) {
    return (
      <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <WelcomeScreen onSuggestionClick={onSuggestionClick} />
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 backdrop-blur-md px-4 py-3 text-sm text-destructive"
            >
              {error.message ||
                'The assistant could not respond. Verify your API key, model, and network.'}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={cn(
                'nexinc-glass-soft flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-muted-foreground border border-border/50',
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground/90">
                {modelInfo?.label ?? 'Model'}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {speedLabel}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {messages.map((message, index) => {
              const lastIdx = messages.length - 1
              const isLastAssistant =
                message.role === 'assistant' && index === lastIdx
              return (
                <MessageBubble
                  key={message.id || index}
                  message={message}
                  isLoading={isLoading && isLastAssistant}
                  isStreaming={isLoading && isLastAssistant}
                  markdownEnabled={markdownEnabled}
                  onRegenerate={
                    message.role === 'assistant' && !isLoading
                      ? () => onRegenerate(message.id)
                      : undefined
                  }
                  onEditUser={
                    message.role === 'user' && !isLoading
                      ? (text) => onEditUserMessage(message.id, text)
                      : undefined
                  }
                />
              )
            })}
          </div>

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-start gap-4 mt-6 opacity-90">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">Reasoning…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-xl border border-border/60 bg-card/90 backdrop-blur-md"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
