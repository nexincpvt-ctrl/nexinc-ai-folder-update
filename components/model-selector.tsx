'use client'

import { useMemo, useState } from 'react'
import { useChatStore } from '@/lib/store'
import { modelConfigs, APIProvider, getModelsByProvider } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Sparkles,
  Zap,
  Brain,
  Image as ImageIcon,
  FileText,
  Code,
  Check,
  Info,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const providerTabs = [
  { id: 'all', label: 'All Models', icon: Sparkles },
  { id: 'openai', label: 'OpenAI', icon: () => <span className="text-sm">🟢</span> },
  { id: 'anthropic', label: 'Anthropic', icon: () => <span className="text-sm">🟠</span> },
  { id: 'google', label: 'Google', icon: () => <span className="text-sm">🔵</span> },
  { id: 'groq', label: 'Groq', icon: Zap },
  { id: 'xai', label: 'xAI', icon: () => <span className="text-sm">✖️</span> },
]

const capabilityIcons = {
  text: { icon: Sparkles, label: 'Text' },
  image: { icon: ImageIcon, label: 'Vision' },
  pdf: { icon: FileText, label: 'PDF' },
  code: { icon: Code, label: 'Code' },
  reasoning: { icon: Brain, label: 'Reasoning' },
}

const speedColors = {
  fast: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning-foreground',
  slow: 'bg-primary/20 text-primary',
}

const qualityLabels = {
  standard: 'Standard',
  high: 'High Quality',
  premium: 'Premium',
}

export function ModelSelector() {
  const { modelSelectorOpen, setModelSelectorOpen, selectedModel, setSelectedModel, activeProvider, setActiveProvider } = useChatStore()
  const [search, setSearch] = useState('')

  const filteredModels = useMemo(() => {
    let models = activeProvider === 'all' ? modelConfigs : getModelsByProvider(activeProvider as APIProvider)
    
    if (search) {
      const query = search.toLowerCase()
      models = models.filter(
        (m) =>
          m.nexincName.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.capabilities.some((c) => c.toLowerCase().includes(query))
      )
    }
    
    return models
  }, [activeProvider, search])

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setModelSelectorOpen(false)
  }

  return (
    <Dialog open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Select Model
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose from various AI models across different providers including OpenAI, Anthropic, Google, Groq, and xAI.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Provider Tabs */}
        <Tabs value={activeProvider} onValueChange={(v) => setActiveProvider(v as APIProvider | 'all')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-6 h-auto gap-1 bg-muted/50 p-1">
            {providerTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs py-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <div className="grid gap-3 pr-4">
              {filteredModels.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No models found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all hover:border-primary/50',
                      selectedModel === model.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{model.nexincName}</h3>
                          {selectedModel === model.id && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                          {model.quality === 'premium' && (
                            <Star className="h-4 w-4 text-warning shrink-0 fill-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {model.description}
                        </p>

                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {model.capabilities.map((cap) => {
                            const capInfo = capabilityIcons[cap]
                            return (
                              <Badge
                                key={cap}
                                variant="secondary"
                                className="gap-1 text-xs font-normal"
                              >
                                <capInfo.icon className="h-3 w-3" />
                                {capInfo.label}
                              </Badge>
                            )
                          })}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Context:</span>
                            <span>{(model.contextWindow / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Output:</span>
                            <span>{(model.maxOutput / 1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      </div>

                      {/* Speed & Quality badges */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', speedColors[model.speed])}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {model.speed === 'fast' ? 'Fast' : model.speed === 'slow' ? 'Thoughtful' : 'Balanced'}
                        </Badge>
                        <Badge variant="outline" className="text-xs justify-center">
                          {qualityLabels[model.quality]}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>

        {/* Info footer */}
        <div className="flex items-center gap-2 pt-4 border-t border-border text-xs text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>
            Models are powered by the Vercel AI Gateway. Configure API keys in Settings for additional providers.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
