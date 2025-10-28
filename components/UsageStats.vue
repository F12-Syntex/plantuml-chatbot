<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="AI Usage Stats">
    <div class="space-y-4">
      <!-- Credit summary card -->
      <div class="stats stats-vertical sm:stats-horizontal shadow w-full">
        <div class="stat">
          <div class="stat-figure text-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div class="stat-title">Remaining Credits</div>
          <div class="stat-value text-success">${{ remainingCredits.toFixed(2) }}</div>
          <div class="stat-desc">${{ (credits?.total_credits ?? 0).toFixed(2) }} total purchased</div>
        </div>
      </div>

      <!-- Credit Usage -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-sm">Credit Usage</h3>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span>Used</span>
              <span class="font-mono">${{ (credits?.total_usage ?? 0).toFixed(4) }}</span>
            </div>
            <progress class="progress progress-warning" :value="credits?.total_usage ?? 0" :max="credits?.total_credits ?? 100"></progress>
            <div class="flex justify-between text-xs opacity-70">
              <span>{{ usagePercentage.toFixed(1) }}% consumed</span>
              <span>${{ remainingCredits.toFixed(2) }} left</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
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

interface LocalStats {
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

const credits = ref<Credits | null>(null)
const localStats = ref<LocalStats>({
  totalCost: 0,
  totalMessages: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  recentUsage: []
})

const remainingCredits = computed(() => {
  const total = credits.value?.total_credits ?? 0
  const used = credits.value?.total_usage ?? 0
  return Math.max(0, total - used)
})

const usagePercentage = computed(() => {
  const total = credits.value?.total_credits ?? 0
  const used = credits.value?.total_usage ?? 0
  return total > 0 ? (used / total) * 100 : 0
})

function loadLocalStats() {
  if (process.client) {
    const stored = localStorage.getItem('usage-stats')
    if (stored) {
      const records: UsageRecord[] = JSON.parse(stored)
      localStats.value = {
        totalCost: records.reduce((sum, r) => sum + r.cost, 0),
        totalMessages: records.length,
        totalPromptTokens: records.reduce((sum, r) => sum + r.promptTokens, 0),
        totalCompletionTokens: records.reduce((sum, r) => sum + r.completionTokens, 0),
        recentUsage: records.slice(-20).reverse()
      }
    }
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
  loadLocalStats()
  loadCredits()
}

function exportStats() {
  const exportData = {
    stats: localStats.value,
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

function addUsageRecord(model: string, promptTokens: number, completionTokens: number, cost: number) {
  if (!process.client) return
  
  const record: UsageRecord = {
    timestamp: Date.now(),
    model,
    tokens: promptTokens + completionTokens,
    promptTokens,
    completionTokens,
    cost
  }
  
  const stored = localStorage.getItem('usage-stats')
  const records: UsageRecord[] = stored ? JSON.parse(stored) : []
  records.push(record)
  localStorage.setItem('usage-stats', JSON.stringify(records))
  
  loadLocalStats()
}

onMounted(() => {
  loadLocalStats()
  loadCredits()
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      loadLocalStats()
      loadCredits()
    }
  }
)

defineExpose({ loadLocalStats, loadCredits, addUsageRecord })
</script>