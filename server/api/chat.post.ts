export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenRouter API key not configured'
    })
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: body.model || 'openai/gpt-4o-mini',
      messages: body.messages,
      stream: true
    })
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'Failed to get response from OpenRouter'
    })
  }

  if (!response.body) {
    throw createError({
      statusCode: 500,
      message: 'No response body'
    })
  }

  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let buffer = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })

          while (true) {
            const lineEnd = buffer.indexOf('\n')
            if (lineEnd === -1) break

            const line = buffer.slice(0, lineEnd).trim()
            buffer = buffer.slice(lineEnd + 1)

            if (line) {
              controller.enqueue(new TextEncoder().encode(line + '\n'))
            }
          }
        }

        if (buffer.trim()) {
          controller.enqueue(new TextEncoder().encode(buffer))
        }
      } catch (error) {
        console.error('Stream error:', error)
        controller.error(error)
      } finally {
        controller.close()
      }
    }
  })

  return stream
})