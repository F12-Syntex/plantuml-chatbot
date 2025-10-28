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
            messages: [
        {
          role: 'system',
          content: `You are a PlantUML diagram expert. When users describe what they want, generate the complete PlantUML code.

          Rules:
          1. Always provide ONLY the raw PlantUML code starting with @startuml and ending with @enduml
          2. DO NOT wrap the code in markdown code blocks or backticks
          3. DO NOT add explanations before or after unless specifically requested
          4. The code should be directly usable
          5. Include helpful comments within the PlantUML syntax using ' for single-line comments
          6. For complex diagrams, add brief structural comments
          7. Always start fresh with complete code from @startuml to @enduml
          8. When modifying existing diagrams, provide the FULL updated code from the beginning`
                  },
        ...body.messages
      ],
      max_tokens: body.max_tokens ?? 2048,
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