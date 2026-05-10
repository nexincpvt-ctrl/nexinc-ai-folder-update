'use client'

import { useState } from 'react'
import { useChatStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
  Edit3,
  Archive,
  Star,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

interface SidebarProps {
  onNewChat: () => void
  onSelectChat: (id: string) => void
}

export function Sidebar({ onNewChat, onSelectChat }: SidebarProps) {
  const {
    chats,
    currentChatId,
    deleteChat,
    sidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
    clearAllChats,
    updateChat,
  } = useChatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  const groupedChats = {
    today: filteredChats.filter((c) => isToday(new Date(c.updatedAt))),
    yesterday: filteredChats.filter((c) => isYesterday(new Date(c.updatedAt))),
    thisWeek: filteredChats.filter(
      (c) =>
        isThisWeek(new Date(c.updatedAt)) &&
        !isToday(new Date(c.updatedAt)) &&
        !isYesterday(new Date(c.updatedAt))
    ),
    thisMonth: filteredChats.filter(
      (c) => isThisMonth(new Date(c.updatedAt)) && !isThisWeek(new Date(c.updatedAt))
    ),
    older: filteredChats.filter((c) => !isThisMonth(new Date(c.updatedAt))),
  }

  const handleRename = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateChat(id, { title: newTitle.trim() })
    }
    setEditingId(null)
  }

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center py-4 px-2 border-r border-border bg-sidebar h-screen">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="mb-4"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="mb-2"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="mt-auto"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-72 border-r border-border bg-sidebar h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">Nexinc</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {Object.entries(groupedChats).map(([group, chatsInGroup]) =>
          chatsInGroup.length > 0 ? (
            <div key={group} className="mb-4">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                {group === 'today'
                  ? 'Today'
                  : group === 'yesterday'
                  ? 'Yesterday'
                  : group === 'thisWeek'
                  ? 'This Week'
                  : group === 'thisMonth'
                  ? 'This Month'
                  : 'Older'}
              </div>
              {chatsInGroup.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1',
                    currentChatId === chat.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {editingId === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(chat.id, editTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id, editTitle)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="h-6 py-0 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm">{chat.title}</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditTitle(chat.title)
                          setEditingId(chat.id)
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Add to favorites
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : null
        )}

        {filteredChats.length === 0 && (
          <div className="px-3 py-8 text-center text-muted-foreground text-sm">
            {searchQuery ? 'No chats found' : 'No conversations yet'}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex-1 justify-start gap-2"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          {chats.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={clearAllChats}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all chats
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
