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
import { Search, Sparkles, Zap, Layers, Globe, Cpu, Hexagon, Settings2, AlertCircle, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = ByokProvider | 'all'

const providerTabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'nexinc-local', label: 'Nexinc AI', icon: Sparkles },
  { id: 'openai', label: 'OpenAI', icon: Cpu },
  { id: 'gemini', label: 'Gemini', icon: Zap },
  { id: 'openrouter', label: 'OpenRouter', icon: Globe },
  { id: 'anthropic', label: 'Claude', icon: Hexagon },
  { id: 'xai', label: 'Grok', icon: Cpu },
  { id: 'lmstudio', label: 'LM Studio', icon: Monitor },
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
      <DialogContent className="nexinc-glass !fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !max-w-none !w-screen !h-screen flex flex-col !p-0 !border-none !rounded-none !shadow-none overflow-hidden gap-0">
        <div className="flex flex-1 overflow-hidden h-full">
          {/* Left Sidebar for Providers */}
          <aside className="w-64 border-r border-border/60 bg-muted/20 flex flex-col shrink-0">
            <div className="p-6 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Intelligence Sources</h3>
              <div className="flex flex-col gap-1.5">
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
                        'w-full justify-start h-11 text-xs font-bold rounded-xl transition-all duration-300 px-3',
                        on ? 'nexinc-chip-active shadow-md bg-primary text-primary-foreground' : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground',
                      )}
                      onClick={() => setActiveProvider(tab.id === 'all' ? 'all' : tab.id)}
                    >
                      <Icon className={cn("h-4 w-4 mr-2.5 shrink-0", on ? "text-primary-foreground" : "text-primary/70")} />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-11 rounded-xl border-border/60 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-bold text-[10px] uppercase tracking-wider"
                onClick={() => {
                  setModelSelectorOpen(false)
                  setSettingsOpen(true)
                }}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                API Keys
              </Button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background/20 backdrop-blur-sm">
            <div className="p-6 pb-4 border-b border-border/40 flex flex-col gap-4 shrink-0">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Model Intelligence Hub
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground/70">
                  Select a specialized AI model powered by your private API keys.
                </DialogDescription>
              </DialogHeader>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <Input
                  placeholder="Filter models by name, engine, or provider..."
                  value={search || ''}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 text-sm rounded-xl bg-background/40 backdrop-blur-md border-border/60 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filtered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground">
                    <Search className="h-12 w-12 mb-4 opacity-10" />
                    <p className="text-lg font-medium opacity-50">No results for &quot;{search}&quot;</p>
                  </div>
                ) : (
                  filtered.map((model) => {
                    const Tier = tierLabel[model.tier]
                    const t = Tier()
                    const isNexinc = model.provider === 'nexinc' || model.provider === 'nexinc-local'
                    
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelect(model.id)}
                        className={cn(
                          'group relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col min-h-[160px] bg-card shadow-sm',
                          selectedModel === model.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border/60 hover:border-primary/50 hover:shadow-md'
                        )}
                      >
                        <div className="flex items-start gap-4 w-full h-full">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            isNexinc ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {isNexinc ? <Sparkles className="h-6 w-6" /> : <Zap className="h-6 w-6 text-muted-foreground" />}
                          </div>

                          <div className="flex-1 flex flex-col min-w-0 h-full">
                            <div className="mb-2">
                              <h4 className="text-base font-bold text-foreground block mb-1">
                                {model.label || "Unknown Model"}
                              </h4>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {BYOK_PROVIDER_LABELS[model.provider] || "Model Provider"}
                              </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {model.description || "Model description not available."}
                            </p>

                            <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                                <Cpu className="h-3 w-3" />
                                {model.apiModelId || "no-id"}
                              </div>
                              
                              <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground border">
                                {t.text || model.tier}
                              </div>
                            </div>
                          </div>
                        </div>

                        {selectedModel === model.id && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold shadow-sm">
                            Active
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="p-4 px-6 border-t border-border/40 bg-muted/5 shrink-0">
              <div className="flex gap-4 items-center justify-between">
                <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/60">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  <p>All keys are encrypted locally and never leave your secure browser environment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
