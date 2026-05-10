import { NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let content = ''
    let type: 'image' | 'pdf' | 'document' = 'document'

    if (file.type.startsWith('image/')) {
      type = 'image'
      content = `data:${file.type};base64,${buffer.toString('base64')}`
    } else if (file.type === 'application/pdf') {
      type = 'pdf'
      try {
        const parser = new PDFParse({ data: buffer })
        const extracted = await parser.getText()
        await parser.destroy()
        content = extracted.text || '[PDF parsed with no plain text]'
      } catch {
        content = '[Unable to extract PDF text — try another PDF]'
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      type = 'document'
      try {
        const mammoth = await import('mammoth')
        const result = await mammoth.extractRawText({ buffer })
        content = result.value
      } catch {
        content = '[Document extraction failed]'
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      type = 'document'
      content = buffer.toString('utf-8')
    } else {
      try {
        content = buffer.toString('utf-8')
      } catch {
        content = '[Binary file — cannot decode as UTF-8]'
      }
    }

    const url = type === 'image' ? content : ''

    return NextResponse.json({
      id: crypto.randomUUID(),
      type,
      name: file.name,
      url,
      content: type === 'image' ? '' : content,
      size: file.size,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
