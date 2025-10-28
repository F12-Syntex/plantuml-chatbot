export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messages, model } = body
  
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
      'HTTP-Referer': 'https://plantuml-chat.app',
      'X-Title': 'PlantUML Chat'
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-3.5-sonnet',
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
        ...messages
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw createError({
      statusCode: response.status,
      message: error
    })
  }

  const data = await response.json()
  return data
})