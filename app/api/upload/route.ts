import { NextResponse } from 'next/server'

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
        // @ts-ignore
        const pdf = await import('pdf-parse')
        const parse = (pdf as any).default || pdf
        const data = await parse(buffer)
        content = data.text || '[PDF parsed with no plain text]'
      } catch (e) {
        console.error('PDF parse error:', e)
        content = '[Unable to extract PDF text — try another PDF]'
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      type = 'document'
      try {
        // @ts-ignore
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
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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
