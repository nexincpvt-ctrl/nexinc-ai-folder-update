'use client'

import { useChatStore } from '@/lib/store'
import { getModelById } from '@/lib/types'
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
} from 'lucide-react'

const suggestions = [
  {
    icon: Code,
    title: 'Help me debug this code',
    description: 'Analyze and fix code issues',
    prompt: 'I have a bug in my code. Can you help me debug it?',
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
  const { selectedModel } = useChatStore()
  const modelConfig = getModelById(selectedModel)

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Nexinc</h1>
          <p className="text-muted-foreground text-lg">
            Your intelligent AI assistant powered by cutting-edge technology
          </p>
        </div>

        {/* Current Model */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">{modelConfig?.nexincName || 'Nexinc Pro'}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{modelConfig?.description}</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
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
