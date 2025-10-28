interface UsageData {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
}

async function calculateCost(model: string, promptTokens: number, completionTokens: number): Promise<number> {
  const modelData = await fetch('https://openrouter.ai/api/v1/models').then(r => r.json())
  const foundModel = modelData.data.find((m: any) => m.id === model || m.canonical_slug === model)
  
  if (!foundModel?.pricing) {
    return 0
  }
  
  const inputCost = (promptTokens / 1_000_000) * parseFloat(foundModel.pricing.prompt)
  const outputCost = (completionTokens / 1_000_000) * parseFloat(foundModel.pricing.completion)
  
  return inputCost + outputCost
}

async function saveUsage(usage: UsageData) {
  const storage = useStorage('data')
  const usageData = await storage.getItem('usage-stats') as any || { records: [] }
  
  if (!usageData.records) {
    usageData.records = []
  }
  
  usageData.records.push({
    timestamp: Date.now(),
    ...usage
  })
  
  if (usageData.records.length > 1000) {
    usageData.records = usageData.records.slice(-1000)
  }
  
  await storage.setItem('usage-stats', usageData)
}

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
  
  if (data.usage) {
    const usage: UsageData = {
      model: model || 'anthropic/claude-3.5-sonnet',
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
      cost: await calculateCost(
        model || 'anthropic/claude-3.5-sonnet',
        data.usage.prompt_tokens || 0,
        data.usage.completion_tokens || 0
      )
    }
    await saveUsage(usage)
  }
  
  return data
})