'use client'

import { useChatStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { getCatalogModel } from '@/lib/byok/model-catalog'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Code,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  MessageSquare,
  Zap,
  Brain,
  Palette,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { readEncryptedBundle } from '@/lib/byok/crypto'
import { useState, useEffect } from 'react'

const suggestions = [
  {
    icon: Sparkles,
    title: 'Use Nexinc AI (Free)',
    description: 'Powered by your local machine',
    prompt: 'Start a session with Nexinc AI. How are you today?',
  },
  {
    icon: FileText,
    title: 'Summarize a document',
    description: 'Extract key points from text',
    prompt: 'Can you help me summarize a document? I\'ll paste the content.',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    description: 'Generate creative solutions',
    prompt: 'I need help brainstorming ideas for a new project. Can you help?',
  },
  {
    icon: MessageSquare,
    title: 'Write an email',
    description: 'Professional communication',
    prompt: 'Help me write a professional email.',
  },
  {
    icon: Brain,
    title: 'Explain a concept',
    description: 'Learn something new',
    prompt: 'Can you explain a complex concept in simple terms?',
  },
  {
    icon: Palette,
    title: 'Generate content',
    description: 'Create articles, stories, or posts',
    prompt: 'Help me generate creative content for my project.',
  },
]

const capabilities = [
  { icon: Code, label: 'Code', description: 'Write, debug, and explain code' },
  { icon: FileText, label: 'Documents', description: 'Analyze PDFs and text files' },
  { icon: ImageIcon, label: 'Images', description: 'Understand and describe images' },
  { icon: Globe, label: 'Research', description: 'Help with research tasks' },
]

interface WelcomeScreenProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const { selectedModel, setSettingsOpen } = useChatStore()
  const modelConfig = getCatalogModel(selectedModel)
  const [hasKey, setHasKey] = useState(true)

  useEffect(() => {
    if (!modelConfig) return
    const bundle = readEncryptedBundle()
    // Nexinc Local and LM Studio providers don't require a stored API key
    const isFree = modelConfig.provider === 'nexinc-local' || modelConfig.provider === 'lmstudio'
    setHasKey(isFree || !!bundle[modelConfig.provider])
  }, [selectedModel, modelConfig])

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full text-center space-y-2">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/75 flex items-center justify-center mb-5 shadow-xl shadow-primary/35">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Nexinc</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Local-first AI workspace. Use <strong>Nexinc AI</strong> for free local inference (no key required) or connect your cloud providers via BYOK.
          </p>
        </div>

        {/* Current Model */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full nexinc-glass-soft border text-sm mx-auto transition-colors",
            hasKey ? "border-border/60" : "border-destructive/50 bg-destructive/5 text-destructive"
          )}>
            {hasKey ? <Zap className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4" />}
            <span className="font-medium">{modelConfig?.label || 'Pick a model'}</span>
            <span className="text-muted-foreground">•</span>
            <span className={cn(
              "text-left max-w-md line-clamp-2",
              hasKey ? "text-muted-foreground" : "text-destructive/80"
            )}>
              {hasKey 
                ? (modelConfig?.description || 'Your workspace is ready.')
                : `Missing API key for ${modelConfig?.provider.toUpperCase()}`
              }
            </span>
          </div>

          {!hasKey && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary h-auto p-0"
              onClick={() => setSettingsOpen(true)}
            >
              Add your API key in Settings → Connections
            </Button>
          )}
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="flex flex-col items-center p-4 rounded-xl bg-card/70 border border-border/70 hover:border-primary/40 hover:bg-card/90 backdrop-blur-md transition-all duration-200"
            >
              <cap.icon className="h-6 w-6 text-primary mb-2" />
              <span className="font-medium text-sm">{cap.label}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">{cap.description}</span>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Try asking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.title}
                variant="outline"
                className="h-auto p-4 justify-start text-left hover:bg-accent hover:border-primary/50 transition-all group"
                onClick={() => onSuggestionClick?.(suggestion.prompt)}
              >
                <suggestion.icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{suggestion.title}</span>
                  <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-muted-foreground mt-8">
          Type your message below or choose a suggestion to get started
        </p>
      </div>
    </div>
  )
}
