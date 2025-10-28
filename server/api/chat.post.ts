interface UsageData {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
}

interface StoredUsageRecord extends UsageData {
  timestamp: number
}

interface UsageStats {
  records: StoredUsageRecord[]
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  // Extract pricing from the model's pricing object if available
  // These are per-million-token prices, so we divide by 1,000,000
  const pricing = {
    'openai/gpt-5-mini': { input: 0.00000025, output: 0.000002 },
    'openai/gpt-5': { input: 0.00000125, output: 0.00001 },
    'anthropic/claude-3.5-sonnet': { input: 0.000003, output: 0.000015 },
    'anthropic/claude-3-opus': { input: 0.000015, output: 0.000075 },
    'default': { input: 0.000001, output: 0.000002 }
  }
  
  const modelPricing = pricing[model as keyof typeof pricing] || pricing['default']
  const inputCost = promptTokens * modelPricing.input
  const outputCost = completionTokens * modelPricing.output
  return inputCost + outputCost
}

async function saveUsage(usage: UsageData) {
  const storage = useStorage('data')
  let usageData = await storage.getItem<UsageStats>('usage-stats')
  
  if (!usageData || !usageData.records) {
    usageData = { records: [] }
  }
  
  usageData.records.push({
    timestamp: Date.now(),
    ...usage
  })
  
  // Keep only last 1000 records
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
      model: model || 'openai/gpt-5-mini',
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
  
  // Save usage stats
  if (data.usage) {
    const usage: UsageData = {
      model: model || 'openai/gpt-5-mini',
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
      cost: calculateCost(
        model || 'openai/gpt-5-mini',
        data.usage.prompt_tokens || 0,
        data.usage.completion_tokens || 0
      )
    }
    
    await saveUsage(usage)
  }
  
  return data
})