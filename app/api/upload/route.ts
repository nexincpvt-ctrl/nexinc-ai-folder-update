import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    let content = ''
    let type: 'image' | 'pdf' | 'document' = 'document'

    // Determine file type and extract content
    if (file.type.startsWith('image/')) {
      type = 'image'
      // For images, we'll send the base64 data
      content = `data:${file.type};base64,${buffer.toString('base64')}`
    } else if (file.type === 'application/pdf') {
      type = 'pdf'
      // For PDFs, we'll use pdf-parse on the client or just note it
      try {
        // Dynamic import for pdf-parse
        const pdfParse = (await import('pdf-parse')).default
        const pdfData = await pdfParse(buffer)
        content = pdfData.text
      } catch {
        content = '[PDF content - text extraction not available]'
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
        content = '[Document content - text extraction not available]'
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      type = 'document'
      content = buffer.toString('utf-8')
    } else {
      // Try to read as text
      try {
        content = buffer.toString('utf-8')
      } catch {
        content = '[Binary file - cannot extract text]'
      }
    }

    // Create a data URL for preview (for images)
    const url = type === 'image' ? content : ''

    return NextResponse.json({
      id: crypto.randomUUID(),
      type,
      name: file.name,
      url,
      content: type === 'image' ? '' : content,
      size: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
