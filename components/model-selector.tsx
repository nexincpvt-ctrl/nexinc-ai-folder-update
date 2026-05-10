'use client'

import { useMemo, useState } from 'react'
import { useChatStore } from '@/lib/store'
import type { ByokProvider } from '@/lib/byok/types'
import { BYOK_PROVIDER_LABELS } from '@/lib/byok/types'
import { catalogForProvider } from '@/lib/byok/model-catalog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Sparkles, Zap, Layers, Globe, Cpu, Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = ByokProvider | 'all'

const providerTabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'openai', label: 'OpenAI', icon: Cpu },
  { id: 'gemini', label: 'Gemini', icon: Sparkles },
  { id: 'openrouter', label: 'OpenRouter', icon: Globe },
  { id: 'anthropic', label: 'Claude', icon: Hexagon },
]

const tierLabel = {
  fast: () => ({ text: 'Fast', className: 'text-emerald-500' }),
  balanced: () => ({ text: 'Balanced', className: 'text-amber-500' }),
  max: () => ({ text: 'Max', className: 'text-primary' }),
} as const

export function ModelSelector() {
  const {
    modelSelectorOpen,
    setModelSelectorOpen,
    selectedModel,
    setSelectedModel,
    activeProvider,
    setActiveProvider,
    setSettingsOpen,
  } = useChatStore()

  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const list =
      activeProvider === 'all'
        ? catalogForProvider('all')
        : catalogForProvider(activeProvider as ByokProvider)

    const q = search.trim().toLowerCase()
    if (!q.length) return list
    return list.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        m.apiModelId.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q),
    )
  }, [activeProvider, search])

  const handleSelect = (id: string) => {
    setSelectedModel(id)
    setModelSelectorOpen(false)
  }

  return (
    <Dialog open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
      <DialogContent className="nexinc-glass max-w-4xl max-h-[88vh] flex flex-col border-border/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Models (BYOK)
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a curated model preset using your saved API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
          {providerTabs.map((tab) => {
            const Icon = tab.icon
            const on = tab.id === 'all' ? activeProvider === 'all' : activeProvider === tab.id
            return (
              <Button
                key={tab.id}
                type="button"
                variant={on ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'flex-1 min-w-[4.25rem] h-9 text-xs rounded-lg',
                  on && 'nexinc-chip-active shadow-sm',
                )}
                onClick={() => setActiveProvider(tab.id === 'all' ? 'all' : tab.id)}
              >
                <Icon className="h-3.5 w-3.5 mr-1 shrink-0" />
                {tab.label}
              </Button>
            )
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search presets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background/60 backdrop-blur"
          />
        </div>

        <ScrollArea className="flex-1 min-h-[320px] pr-2">
          <div className="grid gap-2 pb-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No matches for &quot;{search}&quot;
              </div>
            ) : (
              filtered.map((model) => {
                const Tier = tierLabel[model.tier]
                const t = Tier()
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelect(model.id)}
                    className={cn(
                      'nexinc-glass-soft w-full text-left px-4 py-3 rounded-2xl border transition-all duration-150',
                      selectedModel === model.id
                        ? 'border-primary/70 ring-1 ring-primary/30 shadow-md'
                        : 'border-transparent hover:border-border/80',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold leading-tight truncate">{model.label}</p>
                          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted/80 shrink-0">
                            {BYOK_PROVIDER_LABELS[model.provider]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{model.description}</p>
                        {model.apiModelId ? (
                          <p className="text-[11px] font-mono text-muted-foreground/80 mt-2 truncate">
                            {model.apiModelId}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-500/90 mt-2">
                            Paste your slug below Settings → Connections
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn('text-[10px] uppercase font-semibold flex items-center gap-1', t.className)}>
                          <Zap className="h-3 w-3" /> {t.text}
                        </span>
                        {selectedModel === model.id ? (
                          <span className="text-xs text-primary font-medium">Selected</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-1 border-t border-border/70 text-[11px] text-muted-foreground items-center justify-between flex-wrap">
          <span>Keys encrypted in-browser; routed through /api/chat on your deployment.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              setModelSelectorOpen(false)
              setSettingsOpen(true)
            }}
          >
            Open Connections
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
