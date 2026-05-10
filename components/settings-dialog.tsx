'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useChatStore } from '@/lib/store'
import { APIProvider } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Palette,
  MessageSquare,
  Sliders,
  Key,
  Globe,
  Bell,
  Shield,
  Keyboard,
  Volume2,
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  Sparkles,
  Code,
  FileText,
  HelpCircle,
  Download,
  Upload,
  Trash2,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'model', label: 'Model', icon: Sliders },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'about', label: 'About', icon: Info },
]

const codeThemes = [
  { id: 'oneDark', label: 'One Dark' },
  { id: 'github', label: 'GitHub' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'monokai', label: 'Monokai' },
  { id: 'nord', label: 'Nord' },
]

const languages = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'zh', label: '中文' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' },
  { id: 'pt', label: 'Português' },
  { id: 'ru', label: 'Русский' },
  { id: 'ar', label: 'العربية' },
]

const shortcuts = [
  { keys: ['Ctrl/⌘', 'Enter'], action: 'Send message' },
  { keys: ['Ctrl/⌘', 'N'], action: 'New chat' },
  { keys: ['Ctrl/⌘', 'Shift', 'S'], action: 'Open settings' },
  { keys: ['Ctrl/⌘', 'K'], action: 'Open model selector' },
  { keys: ['Ctrl/⌘', '/'], action: 'Toggle sidebar' },
  { keys: ['Ctrl/⌘', 'U'], action: 'Upload file' },
  { keys: ['Ctrl/⌘', 'L'], action: 'Clear chat' },
  { keys: ['Esc'], action: 'Close dialog' },
]

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, settings, updateSettings, resetSettings, clearAllChats, chats } = useChatStore()
  const { setTheme, theme } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})

  // Sync theme when settings change
  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: value })
    setTheme(value)
  }

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleApiKeyChange = (provider: APIProvider, value: string) => {
    const updatedConfigs = settings.apiConfigs.map((config) =>
      config.provider === provider
        ? { ...config, apiKey: value, enabled: value.length > 0 }
        : config
    )
    updateSettings({ apiConfigs: updatedConfigs })
  }

  const handleExportSettings = () => {
    const data = JSON.stringify(settings, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nexinc-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportChats = () => {
    const data = JSON.stringify(chats, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nexinc-chats.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure your Nexinc AI preferences including appearance, chat behavior, API keys, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-48 border-r border-border p-3">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Language</Label>
                        <p className="text-sm text-muted-foreground">Select your preferred language</p>
                      </div>
                      <Select
                        value={settings.language}
                        onValueChange={(v) => updateSettings({ language: v })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.id} value={lang.id}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-save chats</Label>
                        <p className="text-sm text-muted-foreground">Automatically save conversations</p>
                      </div>
                      <Switch
                        checked={settings.autoSaveChats}
                        onCheckedChange={(v) => updateSettings({ autoSaveChats: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-scroll</Label>
                        <p className="text-sm text-muted-foreground">Scroll to new messages automatically</p>
                      </div>
                      <Switch
                        checked={settings.autoScroll}
                        onCheckedChange={(v) => updateSettings({ autoScroll: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound effects</Label>
                        <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                      </div>
                      <Switch
                        checked={settings.enableSounds}
                        onCheckedChange={(v) => updateSettings({ enableSounds: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notifications</Label>
                        <p className="text-sm text-muted-foreground">Enable desktop notifications</p>
                      </div>
                      <Switch
                        checked={settings.notificationsEnabled}
                        onCheckedChange={(v) => updateSettings({ notificationsEnabled: v })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" onClick={handleExportSettings}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportChats}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chats
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetSettings}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Settings
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearAllChats}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Chats
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Appearance</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">Choose your color theme</p>
                      </div>
                      <Select
                        value={settings.theme}
                        onValueChange={(v: 'light' | 'dark' | 'system') => handleThemeChange(v)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Font Size</Label>
                        <p className="text-sm text-muted-foreground">Adjust text size</p>
                      </div>
                      <Select
                        value={settings.fontSize}
                        onValueChange={(v: 'small' | 'medium' | 'large') => updateSettings({ fontSize: v })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Code Theme</Label>
                        <p className="text-sm text-muted-foreground">Syntax highlighting theme</p>
                      </div>
                      <Select
                        value={settings.codeTheme}
                        onValueChange={(v) => updateSettings({ codeTheme: v as typeof settings.codeTheme })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {codeThemes.map((theme) => (
                            <SelectItem key={theme.id} value={theme.id}>
                              {theme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                      </div>
                      <Switch
                        checked={settings.compactMode}
                        onCheckedChange={(v) => updateSettings({ compactMode: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Timestamps</Label>
                        <p className="text-sm text-muted-foreground">Display time on messages</p>
                      </div>
                      <Switch
                        checked={settings.showTimestamps}
                        onCheckedChange={(v) => updateSettings({ showTimestamps: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Line Numbers</Label>
                        <p className="text-sm text-muted-foreground">Display line numbers in code blocks</p>
                      </div>
                      <Switch
                        checked={settings.showCodeLineNumbers}
                        onCheckedChange={(v) => updateSettings({ showCodeLineNumbers: v })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Settings */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chat Behavior</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send with Enter</Label>
                        <p className="text-sm text-muted-foreground">Press Enter to send messages</p>
                      </div>
                      <Switch
                        checked={settings.sendWithEnter}
                        onCheckedChange={(v) => updateSettings({ sendWithEnter: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Stream Responses</Label>
                        <p className="text-sm text-muted-foreground">Show responses as they generate</p>
                      </div>
                      <Switch
                        checked={settings.streamResponses}
                        onCheckedChange={(v) => updateSettings({ streamResponses: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Markdown</Label>
                        <p className="text-sm text-muted-foreground">Render markdown formatting</p>
                      </div>
                      <Switch
                        checked={settings.enableMarkdown}
                        onCheckedChange={(v) => updateSettings({ enableMarkdown: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable LaTeX</Label>
                        <p className="text-sm text-muted-foreground">Render mathematical equations</p>
                      </div>
                      <Switch
                        checked={settings.enableLatex}
                        onCheckedChange={(v) => updateSettings({ enableLatex: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Web Search</Label>
                        <p className="text-sm text-muted-foreground">Allow AI to search the web</p>
                      </div>
                      <Switch
                        checked={settings.enableWebSearch}
                        onCheckedChange={(v) => updateSettings({ enableWebSearch: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Memory</Label>
                        <p className="text-sm text-muted-foreground">Remember conversation context</p>
                      </div>
                      <Switch
                        checked={settings.enableMemory}
                        onCheckedChange={(v) => updateSettings({ enableMemory: v })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
                  <Textarea
                    value={settings.systemPrompt}
                    onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                    placeholder="Enter a custom system prompt..."
                    className="min-h-32"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    This prompt is sent with every message to customize AI behavior.
                  </p>
                </div>
              </div>
            )}

            {/* Model Settings */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Model Parameters</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Temperature: {settings.temperature.toFixed(1)}</Label>
                        <Badge variant="secondary">Creativity</Badge>
                      </div>
                      <Slider
                        value={[settings.temperature]}
                        min={0}
                        max={2}
                        step={0.1}
                        onValueChange={([v]) => updateSettings({ temperature: v })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values produce more focused responses, higher values more creative.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Max Tokens: {settings.maxTokens}</Label>
                        <Badge variant="secondary">Length</Badge>
                      </div>
                      <Slider
                        value={[settings.maxTokens]}
                        min={256}
                        max={32768}
                        step={256}
                        onValueChange={([v]) => updateSettings({ maxTokens: v })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of the response.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Top P: {settings.topP.toFixed(2)}</Label>
                        <Badge variant="secondary">Diversity</Badge>
                      </div>
                      <Slider
                        value={[settings.topP]}
                        min={0}
                        max={1}
                        step={0.05}
                        onValueChange={([v]) => updateSettings({ topP: v })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls diversity via nucleus sampling.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Frequency Penalty: {settings.frequencyPenalty.toFixed(1)}</Label>
                        <Badge variant="secondary">Repetition</Badge>
                      </div>
                      <Slider
                        value={[settings.frequencyPenalty]}
                        min={0}
                        max={2}
                        step={0.1}
                        onValueChange={([v]) => updateSettings({ frequencyPenalty: v })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reduces repetition of frequently used words.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Presence Penalty: {settings.presencePenalty.toFixed(1)}</Label>
                        <Badge variant="secondary">Topics</Badge>
                      </div>
                      <Slider
                        value={[settings.presencePenalty]}
                        min={0}
                        max={2}
                        step={0.1}
                        onValueChange={([v]) => updateSettings({ presencePenalty: v })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Encourages the model to explore new topics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">API Keys</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Configure API keys to enable additional AI providers. Keys are stored locally in your browser.
                  </p>
                  
                  <div className="space-y-4">
                    {settings.apiConfigs.map((config) => (
                      <div key={config.provider} className="p-4 rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className="font-medium">{config.name}</span>
                            {config.enabled && config.apiKey && (
                              <Badge variant="default" className="bg-success text-success-foreground">
                                <Check className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <Switch
                            checked={config.enabled && config.apiKey.length > 0}
                            onCheckedChange={(v) => {
                              if (!v) {
                                handleApiKeyChange(config.provider, '')
                              }
                            }}
                            disabled={!config.apiKey}
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type={showApiKeys[config.provider] ? 'text' : 'password'}
                            value={config.apiKey}
                            onChange={(e) => handleApiKeyChange(config.provider, e.target.value)}
                            placeholder={`Enter your ${config.name} API key...`}
                            className="pr-10"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => toggleApiKeyVisibility(config.provider)}
                          >
                            {showApiKeys[config.provider] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Using Vercel AI Gateway</p>
                      <p className="text-muted-foreground">
                        By default, Nexinc uses the Vercel AI Gateway which provides access to OpenAI, 
                        Anthropic, and Google models without requiring individual API keys. 
                        Add your own keys for additional providers or custom usage limits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Local Storage Only
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        All your chats, settings, and API keys are stored locally in your browser. 
                        Nothing is sent to our servers unless you explicitly share it.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4 text-primary" />
                        API Key Security
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        API keys are stored encrypted in your browser&apos;s local storage. 
                        They are only sent directly to the respective AI provider.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Danger Zone</h4>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="destructive" size="sm" onClick={clearAllChats}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All Chats
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => {
                          resetSettings()
                          clearAllChats()
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
                  
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm">{shortcut.action}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <span key={i}>
                              <kbd className="px-2 py-1 rounded bg-background text-xs font-mono border border-border">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="mx-1 text-muted-foreground">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Nexinc AI</h2>
                  <p className="text-muted-foreground mb-4">Version 1.0.0</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    A powerful AI assistant built with cutting-edge technology. 
                    Access multiple AI models through a beautiful, intuitive interface.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 25+ AI models from 5 providers</li>
                      <li>• PDF, Image, and Document analysis</li>
                      <li>• Code highlighting and execution</li>
                      <li>• Voice input and text-to-speech</li>
                      <li>• Customizable themes and settings</li>
                      <li>• Local storage for privacy</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50">
                    <h4 className="font-medium mb-2">Powered By</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Vercel AI SDK</Badge>
                      <Badge variant="secondary">Next.js</Badge>
                      <Badge variant="secondary">React</Badge>
                      <Badge variant="secondary">Tailwind CSS</Badge>
                      <Badge variant="secondary">shadcn/ui</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
