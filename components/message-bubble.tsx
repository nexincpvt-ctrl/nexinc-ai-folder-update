'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  User,
  Volume2,
  MoreHorizontal,
  PencilLine,
  Image as ImageIcon,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { UIMessage } from 'ai'

const SANITIZER_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [['className']],
    span: [['className']],
    pre: [['className']],
  },
}

interface MessageBubbleProps {
  message: UIMessage
  isLoading?: boolean
  isStreaming?: boolean
  markdownEnabled?: boolean
  onRegenerate?: () => void
  onEditUser?: (next: string) => void
}

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return ''
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

function getFileParts(message: UIMessage) {
  if (!message.parts || !Array.isArray(message.parts)) return []
  return message.parts.filter(
    (
      p,
    ): p is {
      type: 'file'
      mediaType?: string
      filename?: string
      url?: string
    } => typeof p === 'object' && (p as { type?: string }).type === 'file',
  )
}

export function MessageBubble({
  message,
  isLoading,
  isStreaming,
  markdownEnabled = true,
  onRegenerate,
  onEditUser,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<boolean | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const isUser = message.role === 'user'
  const text = getMessageText(message)
  const files = useMemo(() => getFileParts(message), [message.parts])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  const streamingCaret = Boolean(!isUser && isStreaming && text)

  return (
    <div className={cn('group/message flex items-start gap-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner',
          isUser ? 'bg-secondary' : 'bg-gradient-to-br from-primary to-primary/70',
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-secondary-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        )}
      </div>

      <div className={cn('flex-1 max-w-[min(100%,920px)]', isUser && 'flex flex-col items-end')}>
        {files.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {files.map((p, idx) => {
              const mime = (p.mediaType ?? '').split(';')[0] ?? ''
              const isImg = mime.startsWith('image/')
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-border/60 bg-muted/50 backdrop-blur-sm',
                  )}
                >
                  {isImg ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="truncate max-w-40">{p.filename || 'Attached file'}</span>
                </div>
              )
            })}
          </div>
        ) : null}

        <div
          className={cn(
            'rounded-3xl px-4 py-3 border border-border/50 shadow-md',
            isUser
              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
              : 'nexinc-glass-soft rounded-bl-md shadow-md',
          )}
        >
          {isLoading && !text ? (
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-current animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : isUser ? (
            editing ? (
              <div className="space-y-2 w-full">
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-28" />
                <div className="flex gap-2 justify-end flex-wrap">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                      onEditUser?.(draft)
                      setEditing(false)
                    }}
                  >
                    Save & rerun
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <p className="whitespace-pre-wrap flex-1">{text}</p>
              </div>
            )
          ) : markdownEnabled ? (
            <div
              className={cn(
                'prose prose-sm max-w-none dark:prose-invert',
                streamingCaret && '[&_>*:last-child]:animate-stream-caret',
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, SANITIZER_SCHEMA]]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match && !className

                    if (isInline) {
                      return (
                        <code className="bg-secondary/70 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>
                          {children}
                        </code>
                      )
                    }

                    return (
                      <div className="relative group/code my-4 rounded-xl overflow-hidden border border-border/60">
                        <div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/85 border border-border/60"
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {match && (
                          <div className="text-[11px] text-muted-foreground bg-secondary/80 px-3 py-1 font-mono border-b border-border/50">
                            {match[1]}
                          </div>
                        )}
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match?.[1] || 'text'}
                          PreTag="div"
                          className="!mt-0 !rounded-none"
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    )
                  },
                  p({ children }) {
                    return <p className="my-2 leading-relaxed">{children}</p>
                  },
                  ul({ children }) {
                    return <ul className="my-2 pl-6 list-disc">{children}</ul>
                  },
                  ol({ children }) {
                    return <ol className="my-2 pl-6 list-decimal">{children}</ol>
                  },
                  li({ children }) {
                    return <li className="my-1">{children}</li>
                  },
                  a({ children, href }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        {children}
                      </a>
                    )
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-primary/40 pl-4 italic my-4 text-muted-foreground">
                        {children}
                      </blockquote>
                    )
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-lg border border-border/60">
                        <table className="w-full border-collapse">{children}</table>
                      </div>
                    )
                  },
                  th({ children }) {
                    return (
                      <th className="border border-border/60 px-3 py-2 bg-muted/60 text-left font-semibold">
                        {children}
                      </th>
                    )
                  },
                  td({ children }) {
                    return <td className="border border-border/60 px-3 py-2">{children}</td>
                  },
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className={cn('whitespace-pre-wrap leading-relaxed', streamingCaret && 'animate-stream-caret')}>
              {text}
            </p>
          )}
        </div>

        {isUser && !isLoading && !editing && onEditUser ? (
          <div className="flex mt-2 opacity-0 pointer-events-none group-hover/message:pointer-events-auto group-hover/message:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1"
              type="button"
              onClick={() => {
                setDraft(text)
                setEditing(true)
              }}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        ) : null}

        {!isUser && text && !isLoading && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" type="button" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" type="button" onClick={handleSpeak}>
                    <Volume2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Read aloud</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className={cn('h-7 w-7', liked === true && 'text-success')}
                    onClick={() => setLiked(liked === true ? null : true)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Good</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className={cn('h-7 w-7', liked === false && 'text-destructive')}
                    onClick={() => setLiked(liked === false ? null : false)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Poor</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem
                    disabled={!onRegenerate}
                    className={!onRegenerate ? 'opacity-60' : ''}
                    onSelect={() => onRegenerate?.()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}
