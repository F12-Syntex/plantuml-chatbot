<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Select AI Model">
    <template #header>
      <div class="mt-3 space-y-3">
        <div v-if="selectedModelData" class="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div class="text-xs text-base-content/60 mb-1">Currently selected:</div>
          <div class="font-semibold text-sm text-base-content">{{ selectedModelData.name }}</div>
          <div class="text-xs text-base-content/50 mt-1">{{ selectedModelData.id }}</div>
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search models..." 
          class="input input-bordered w-full"
        />
      </div>
    </template>

    <div class="h-96 overflow-y-auto px-1">
      <div v-if="loading" class="flex justify-center items-center h-full">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      
      <div v-else-if="error" class="alert alert-error">
        <span>{{ error }}</span>
      </div>
      
      <div v-else class="space-y-2 pb-4 pt-4 px-1">
        <button
          v-for="model in filteredModels"
          :key="model.id"
          @click="selectModel(model)"
          class="w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
          :class="currentModel === model.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-base-300 bg-base-200 hover:border-primary/50 hover:shadow-md'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm truncate text-base-content">{{ model.name }}</div>
              <div class="text-xs text-base-content/60 mt-1 truncate">{{ model.id }}</div>
              <div v-if="model.pricing" class="flex gap-3 mt-2 text-xs text-base-content/50">
                <span>Prompt: ${{ (parseFloat(model.pricing.prompt) * 1000000).toFixed(2) }}/1M</span>
                <span>Completion: ${{ (parseFloat(model.pricing.completion) * 1000000).toFixed(2) }}/1M</span>
              </div>
            </div>
            <div 
              v-if="currentModel === model.id" 
              class="flex-shrink-0 bg-primary text-primary-content rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  </ThemeDrawer>
</template>

<script setup lang="ts">
interface Model {
  id: string
  name: string
  pricing?: {
    prompt: string
    completion: string
  }
}

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'model-changed': [modelId: string]
}>()

const models = ref<Model[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const currentModel = ref('anthropic/claude-3.5-haiku')
const searchQuery = ref('')

const selectedModelData = computed(() => {
  return models.value.find(m => m.id === currentModel.value)
})

const filteredModels = computed(() => {
  if (!searchQuery.value) return models.value
  const query = searchQuery.value.toLowerCase()
  return models.value.filter(m => 
    m.name.toLowerCase().includes(query) || 
    m.id.toLowerCase().includes(query)
  )
})

function selectModel(model: Model) {
  currentModel.value = model.id
  emit('model-changed', model.id)
  emit('update:modelValue', false)
}

async function loadModels() {
  try {
    loading.value = true
    error.value = null
    const data = await $fetch<Model[]>('/api/models')
    models.value = data
  } catch (e) {
    error.value = 'Failed to load models'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadModels()
  const saved = localStorage.getItem('selected-model')
  if (saved) {
    currentModel.value = saved
  }
})

watch(currentModel, (newModel) => {
  localStorage.setItem('selected-model', newModel)
})

defineExpose({ currentModel })
</script>