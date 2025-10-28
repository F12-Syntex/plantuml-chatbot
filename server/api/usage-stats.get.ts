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

export default defineEventHandler(async () => {
  const storage = useStorage('data')
  const usageData = await storage.getItem<UsageStats>('usage-stats')
  
  const records = usageData?.records || []
  
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0)
  const totalMessages = records.length
  const totalPromptTokens = records.reduce((sum, r) => sum + (r.promptTokens || 0), 0)
  const totalCompletionTokens = records.reduce((sum, r) => sum + (r.completionTokens || 0), 0)
  const recentUsage = records.slice(-20).reverse().map(r => ({
    timestamp: r.timestamp,
    model: r.model,
    tokens: r.totalTokens,
    promptTokens: r.promptTokens,
    completionTokens: r.completionTokens,
    cost: r.cost
  }))
  
  return {
    totalCost,
    totalMessages,
    totalPromptTokens,
    totalCompletionTokens,
    recentUsage
  }
})