'use client'

import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Trash2, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useChatStore } from '@/lib/store'
import type { ByokProvider } from '@/lib/byok/types'
import { BYOK_PROVIDER_LABELS } from '@/lib/byok/types'
import {
  clearAllProviderKeys,
  loadProviderKey,
  saveProviderKey,
} from '@/lib/byok/crypto'
import { catalogForProvider } from '@/lib/byok/model-catalog'
import { resolveEffectiveModel } from '@/lib/byok/effective-model'
import { toast } from 'sonner'

type RowState = Partial<Record<ByokProvider, { visible: boolean; draft: string; saved: boolean; busy: boolean }>>

const ROWS: { id: ByokProvider; help: string }[] = [
  {
    id: 'nexinc',
    help: 'Nexinc Official API Key (supports all Nexinc models)',
  },
  {
    id: 'lmstudio',
    help: 'Connect to LM Studio (default: http://localhost:1234/v1) or any OpenAI-compatible local API.',
  },
  {
    id: 'openai',
    help: 'From https://platform.openai.com/api-keys',
  },
  {
    id: 'gemini',
    help: 'From Google AI Studio (Generative Language API)',
  },
  {
    id: 'openrouter',
    help: 'From https://openrouter.ai — use any OpenRouter model slug',
  },
  {
    id: 'anthropic',
    help: 'From Anthropic Console (optional if you route via OpenRouter)',
  },
  {
    id: 'xai',
    help: 'From https://console.x.ai',
  },
]

export function ByokConnectionPanel() {
  const { settings, updateSettings, selectedModel, setSelectedModel } = useChatStore()
  const [row, setRow] = useState<RowState>({})

  const refreshMasked = useCallback(async () => {
    const next: RowState = {}
    for (const r of ROWS) {
      const saved = !!(await loadProviderKey(r.id))
      next[r.id] = {
        visible: false,
        draft: '',
        saved,
        busy: false,
      }
    }
    setRow(next)
  }, [])

  useEffect(() => {
    void refreshMasked()
  }, [refreshMasked])

  const setField = (
    provider: ByokProvider,
    patch: Partial<{ visible: boolean; draft: string; saved: boolean; busy: boolean }>,
  ) => {
    setRow((prev) => ({
      ...prev,
      [provider]: { ...(prev[provider] ?? { draft: '', visible: false, saved: false, busy: false }), ...patch },
    }))
  }

  const handleSaveKey = async (provider: ByokProvider) => {
    const draft = row[provider]?.draft ?? ''
    setField(provider, { busy: true })
    try {
      const trimmedKey = draft.trim()
      await saveProviderKey(provider, trimmedKey || null)
      const isSaved = !!(await loadProviderKey(provider))
      setField(provider, { draft: '', saved: isSaved, busy: false })

      if (isSaved) {
        toast.success(`API key for ${BYOK_PROVIDER_LABELS[provider]} saved.`)

        // Check if we should auto-switch model
        const resolved = resolveEffectiveModel(selectedModel, settings)
        const currentProviderKey = resolved ? await loadProviderKey(resolved.provider) : null

        if (!currentProviderKey && provider !== resolved?.provider) {
          const availableModels = catalogForProvider(provider)
          if (availableModels.length > 0) {
            const nextModel = availableModels[0]
            setSelectedModel(nextModel.id)
            toast.info(`Switched to ${nextModel.label} since it matches your new key.`, {
              description: `The previous model required a missing ${resolved?.provider.toUpperCase()} key.`
            })
          }
        }
      }
    } catch (e) {
      setField(provider, { busy: false })
      toast.error('Failed to save API key.')
    }
  }

  const handleRemoveKey = async (provider: ByokProvider) => {
    setField(provider, { busy: true })
    await saveProviderKey(provider, null)
    await refreshMasked()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Bring your own key</h3>
        <p className="text-sm text-muted-foreground">
          Keys stay in your browser encrypted at rest (AES-GCM) and are only sent over HTTPS to your Nexinc{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/chat</code> route — never stored on the server.
        </p>
      </div>

      <div className="space-y-4">
        {ROWS.map((config) => {
          const rs = row[config.id]
          const saved = rs?.saved
          const visible = rs?.visible
          const busy = rs?.busy
          const draft = rs?.draft ?? ''
          const label = BYOK_PROVIDER_LABELS[config.id]
          return (
            <div
              key={config.id}
              className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{label}</span>
                  {saved ? (
                    <Badge className="bg-emerald-600/90 text-white">
                      <Check className="h-3 w-3 mr-1" />
                      Stored
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not configured</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{config.help}</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={visible ? 'text' : 'password'}
                    value={draft || ''}
                    onChange={(e) => setField(config.id, { draft: e.target.value })}
                    placeholder={saved ? 'Enter a new key to replace…' : `Paste ${label} API key`}
                    disabled={busy}
                    className="pr-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-14 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setField(config.id, { visible: !visible })}
                  >
                    {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    type="button"
                    disabled={busy || draft.trim().length < 8}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    onClick={() => void handleSaveKey(config.id)}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
                {saved ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="shrink-0"
                    disabled={busy}
                    onClick={() => void handleRemoveKey(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="custom-or">OpenRouter custom model slug</Label>
          <Input
            id="custom-or"
            value={settings.customOpenRouterModelId || ''}
            onChange={(e) => updateSettings({ customOpenRouterModelId: e.target.value })}
            placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
          />
          <p className="text-xs text-muted-foreground">
            Used for &quot;OpenRouter — your model slug&quot; picker option.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void clearAllProviderKeys().then(refreshMasked)}
        >
          Erase all keys from this browser
        </Button>
      </div>
    </div>
  )
}
