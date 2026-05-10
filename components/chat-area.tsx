'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store'
import { getModelById, Attachment } from '@/lib/types'
import { MessageBubble } from './message-bubble'
import { WelcomeScreen } from './welcome-screen'
import { Sparkles, ArrowDown, Zap } from 'lucide-react'
import type { UIMessage } from 'ai'

interface ChatAreaProps {
  messages: UIMessage[]
  isLoading: boolean
  onSuggestionClick?: (suggestion: string) => void
}

export function ChatArea({ messages, isLoading, onSuggestionClick }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const { selectedModel, settings } = useChatStore()

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (settings.autoScroll) {
      scrollToBottom()
    }
  }, [messages, settings.autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  const modelConfig = getModelById(selectedModel)

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
        className="h-full overflow-y-auto overflow-x-hidden" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Model indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>{modelConfig?.nexincName || 'Nexinc AI'}</span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {modelConfig?.speed === 'fast' ? 'Fast' : modelConfig?.speed === 'slow' ? 'Thoughtful' : 'Balanced'}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                isLast={index === messages.length - 1}
                isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex items-start gap-4 mt-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
