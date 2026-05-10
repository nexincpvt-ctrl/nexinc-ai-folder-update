'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/lib/store'
import { Attachment } from '@/lib/types'
import { getCatalogModel } from '@/lib/byok/model-catalog'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  StopCircle,
  X,
  ChevronDown,
  Camera,
  Sparkles,
  Zap,
  Settings2,
  Globe,
  FileSearch,
  AlertCircle,
} from 'lucide-react'
import { readEncryptedBundle } from '@/lib/byok/crypto'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSend: (attachments?: Attachment[]) => void
  onStop?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function InputArea({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  disabled,
}: InputAreaProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraCaptureRef = useRef<HTMLInputElement>(null)

  const {
    selectedModel,
    setModelSelectorOpen,
    settings,
    updateSettings,
  } = useChatStore()

  const [hasKey, setHasKey] = useState(true)

  const modelConfig = getCatalogModel(selectedModel)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [value])

  // Check if API key exists for selected model
  useEffect(() => {
    if (!modelConfig) return
    const bundle = readEncryptedBundle()
    setHasKey(!!bundle[modelConfig.provider])
  }, [selectedModel])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !settings.sendWithEnter) {
      e.preventDefault()
      handleSend()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && settings.sendWithEnter) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if ((!value.trim() && attachments.length === 0) || isLoading || disabled) return
    onSend(attachments.length > 0 ? attachments : undefined)
    setAttachments([])
  }

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const attachment = await response.json()
          setAttachments((prev) => [...prev, attachment])
        }
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/85 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative group flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm"
              >
                {attachment.type === 'image' ? (
                  <>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    {attachment.url && (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    )}
                  </>
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate max-w-32">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Container */}
        <div
          className={cn(
            'relative rounded-2xl border-2 transition-all duration-200',
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border/70 bg-card/80 backdrop-blur-md hover:border-primary/40 focus-within:border-primary',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-2xl z-10">
              <div className="flex flex-col items-center gap-2 text-primary">
                <Paperclip className="h-8 w-8" />
                <span className="font-medium">Drop files here</span>
              </div>
            </div>
          )}

          {/* Top row with model selector and options */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 gap-1.5 text-xs font-medium transition-colors",
                !hasKey && "text-destructive hover:text-destructive hover:bg-destructive/10"
              )}
              onClick={() => setModelSelectorOpen(true)}
            >
              {hasKey ? (
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {modelConfig?.label || 'Select Model'}
              {!hasKey && <span className="ml-1 opacity-80">(Key missing)</span>}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>

            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('h-7 w-7', settings.enableWebSearch && 'text-primary')}
                      onClick={() => updateSettings({ enableWebSearch: !settings.enableWebSearch })}
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Web Search {settings.enableWebSearch ? 'On' : 'Off'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('h-7 w-7', settings.enableMemory && 'text-primary')}
                      onClick={() => updateSettings({ enableMemory: !settings.enableMemory })}
                    >
                      <FileSearch className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Memory {settings.enableMemory ? 'On' : 'Off'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nexinc..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-2 text-base placeholder:text-muted-foreground/60 bg-transparent"
            disabled={disabled || isLoading}
          />

          {/* Bottom row with actions */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
              <input
                ref={cameraCaptureRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const list = e.target.files
                  if (list?.length) void handleFileUpload(list)
                  e.target.value = ''
                }}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isUploading}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*'
                      fileInputRef.current.click()
                      fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx,.txt,.md'
                    }
                  }}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload Image
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      cameraCaptureRef.current?.click()
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Camera capture
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              {isLoading ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 px-4 gap-2 font-medium"
                  onClick={onStop}
                >
                  <StopCircle className="h-4 w-4" />
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-9 px-4 gap-2 font-medium bg-primary hover:bg-primary/90"
                  onClick={handleSend}
                  disabled={(!value.trim() && attachments.length === 0) || disabled}
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="flex items-center justify-center mt-2">
          <span className="text-xs text-muted-foreground">
            {settings.sendWithEnter ? (
              <>Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift + Enter</kbd> for new line</>
            ) : (
              <>Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl + Enter</kbd> to send</>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
