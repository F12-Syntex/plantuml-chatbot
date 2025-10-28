interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: Message[]
  model?: string
  additionalInstructions?: string
}

interface StoredUsageRecord {
  timestamp: number
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
}

interface UsageStats {
  records: StoredUsageRecord[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequest>(event)
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenRouter API key not configured'
    })
  }

  const storage = useStorage('data')
  const selectedModel = body.model || await storage.getItem<string>('selected-model') || 'openai/gpt-4o-mini'

  const systemMessage = {
    role: 'system' as const,
    content: `You are a PlantUML diagram expert. Generate valid PlantUML code based on user descriptions.

IMPORTANT FORMATTING RULES:
1. Always wrap your PlantUML code in a code block with the language identifier "plantuml"
2. NEVER use any other language identifier (not "uml", not "diagram", only "plantuml")
3. Format must be exactly:
\`\`\`plantuml
@startuml
... your diagram code ...
@enduml
\`\`\`

4. Include proper PlantUML syntax (@startuml, @enduml)
5. Keep diagrams simple and readable
6. Use meaningful names and labels
7. Add skinparam commands for better styling when appropriate${body.additionalInstructions ? '\n\nADDITIONAL INSTRUCTIONS:\n' + body.additionalInstructions : ''}`
  }

  const messagesWithSystem = [systemMessage, ...body.messages]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
      'X-Title': 'PlantUML Chatbot',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: messagesWithSystem,
      stream: true
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw createError({
      statusCode: response.status,
      message: errorData.error?.message || 'Failed to get response from OpenRouter'
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  let totalPromptTokens = 0
  let totalCompletionTokens = 0

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue

            const data = trimmed.slice(6)
            if (data === '[DONE]') {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              continue
            }

            try {
              const parsed = JSON.parse(data)
              
              if (parsed.usage) {
                totalPromptTokens = parsed.usage.prompt_tokens || 0
                totalCompletionTokens = parsed.usage.completion_tokens || 0
              }

              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error)
      } finally {
        if (totalPromptTokens > 0 || totalCompletionTokens > 0) {
          const modelPricing = {
            promptCostPer1M: 0.15,
            completionCostPer1M: 0.6
          }

          const promptCost = (totalPromptTokens / 1_000_000) * modelPricing.promptCostPer1M
          const completionCost = (totalCompletionTokens / 1_000_000) * modelPricing.completionCostPer1M
          const totalCost = promptCost + completionCost

          const usageRecord: StoredUsageRecord = {
            timestamp: Date.now(),
            model: selectedModel,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            totalTokens: totalPromptTokens + totalCompletionTokens,
            cost: totalCost
          }

          const currentStats = await storage.getItem<UsageStats>('usage-stats') || { records: [] }
          currentStats.records.push(usageRecord)
          await storage.setItem('usage-stats', currentStats)
        }

        controller.close()
      }
    }
  })

  return stream
})