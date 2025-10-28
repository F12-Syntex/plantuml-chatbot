<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="AI Usage Stats">
    <div class="space-y-4">
      <div class="stats stats-vertical sm:stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="stat-title">Remaining Credits</div>
          <div class="stat-value text-success">${{ remainingCredits.toFixed(2) }}</div>
          <div class="stat-desc">${{ credits.total_credits?.toFixed(2) || '0.00' }} total purchased</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-title">Total Spent</div>
          <div class="stat-value text-primary">${{ stats.totalCost.toFixed(4) }}</div>
          <div class="stat-desc">Session usage</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div class="stat-title">Messages Sent</div>
          <div class="stat-value text-secondary">{{ stats.totalMessages }}</div>
          <div class="stat-desc">Total conversations</div>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-sm">Credit Usage</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Used</span>
              <span class="font-mono">${{ credits.total_usage?.toFixed(4) || '0.0000' }}</span>
            </div>
            <progress class="progress progress-warning" :value="credits.total_usage || 0" :max="credits.total_credits || 100"></progress>
            <div class="flex justify-between text-xs opacity-70">
              <span>{{ usagePercentage.toFixed(1) }}% consumed</span>
              <span>${{ remainingCredits.toFixed(2) }} left</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-sm">Token Usage</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Prompt Tokens</span>
                <span class="font-mono">{{ stats.totalPromptTokens.toLocaleString() }}</span>
              </div>
              <progress class="progress progress-primary" :value="stats.totalPromptTokens" max="1000000"></progress>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span>Completion Tokens</span>
                <span class="font-mono">{{ stats.totalCompletionTokens.toLocaleString() }}</span>
              </div>
              <progress class="progress progress-secondary" :value="stats.totalCompletionTokens" max="1000000"></progress>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-sm">Recent Usage</h3>
          <div class="overflow-x-auto">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Model</th>
                  <th>Tokens</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(usage, i) in stats.recentUsage" :key="i" class="hover">
                  <td class="font-mono text-xs">{{ formatDate(usage.timestamp) }}</td>
                  <td class="text-xs truncate max-w-[120px]">{{ usage.model }}</td>
                  <td class="font-mono text-xs">{{ usage.tokens }}</td>
                  <td class="font-mono text-xs">${{ usage.cost.toFixed(6) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="refreshStats" class="btn btn-primary btn-sm flex-1">Refresh</button>
        <button @click="exportStats" class="btn btn-outline btn-sm flex-1">Export Data</button>
      </div>
    </div>
  </ThemeDrawer>
</template>

<script setup lang="ts">
interface UsageRecord {
  timestamp: number
  model: string
  tokens: number
  promptTokens: number
  completionTokens: number
  cost: number
}

interface UsageStats {
  totalCost: number
  totalMessages: number
  totalPromptTokens: number
  totalCompletionTokens: number
  recentUsage: UsageRecord[]
}

interface Credits {
  total_credits?: number
  total_usage?: number
}

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const stats = ref<UsageStats>({
  totalCost: 0,
  totalMessages: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  recentUsage: []
})

const credits = ref<Credits>({})

const remainingCredits = computed(() => {
  const total = credits.value.total_credits || 0
  const used = credits.value.total_usage || 0
  return Math.max(0, total - used)
})

const usagePercentage = computed(() => {
  const total = credits.value.total_credits || 0
  const used = credits.value.total_usage || 0
  return total > 0 ? (used / total) * 100 : 0
})

async function loadStats() {
  try {
    const data = await $fetch<UsageStats>('/api/usage-stats')
    stats.value = data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

async function loadCredits() {
  try {
    const data = await $fetch<{ data: Credits }>('/api/credits')
    credits.value = data.data || {}
  } catch (error) {
    console.error('Failed to load credits:', error)
  }
}

function refreshStats() {
  loadStats()
  loadCredits()
}

function exportStats() {
  const exportData = {
    stats: stats.value,
    credits: credits.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `usage-stats-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadStats()
  loadCredits()
})

// Auto-refresh stats when drawer opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadStats()
      loadCredits()
    }
  }
)

defineExpose({ loadStats, loadCredits })
</script>