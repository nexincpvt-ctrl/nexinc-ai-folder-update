import type { Chat, Message } from '@/lib/types'

function linesFromMessages(messages: Message[]): string[] {
  return messages.flatMap((m) => {
    const label = m.role === 'assistant' ? 'Assistant' : m.role === 'system' ? 'System' : 'You'
    return [`### ${label}`, '', m.content || '(empty)', '', '---', '']
  })
}

/** Plain-markdown transcript for archiving or portability */
export function chatToMarkdownExport(chat: Chat): string {
  const header = `# ${chat.title}\n\n_Exported • ${new Date().toISOString()}_\n\n---\n\n`
  return header + linesFromMessages(chat.messages).join('\n')
}
