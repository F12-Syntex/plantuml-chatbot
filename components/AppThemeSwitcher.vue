<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Choose Theme">
    <template #header>
      <div class="mt-3">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search themes..." 
          class="input input-bordered w-full"
        />
      </div>
    </template>

    <div class="overflow-y-auto max-h-[60vh] px-1">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-4 pt-4">
        <button
          v-for="t in filteredThemes"
          :key="t"
          @click="selectTheme(t)"
          :data-theme="t"
          class="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
          :class="currentTheme === t ? 'ring-4 ring-primary shadow-xl' : 'hover:shadow-lg'"
        >
          <div class="bg-base-100 p-4 h-full flex flex-col gap-2 border border-base-300">
            <div class="flex gap-1.5 mb-2">
              <div class="w-2 h-2 rounded-full bg-primary"></div>
              <div class="w-2 h-2 rounded-full bg-secondary"></div>
              <div class="w-2 h-2 rounded-full bg-accent"></div>
            </div>
            <div class="space-y-1.5 flex-1">
              <div class="h-2 bg-base-content/20 rounded w-3/4"></div>
              <div class="h-2 bg-base-content/10 rounded w-1/2"></div>
            </div>
            <div class="pt-2 border-t border-base-300">
              <p class="text-xs sm:text-sm font-semibold text-base-content capitalize truncate">{{ t }}</p>
            </div>
            <div 
              v-if="currentTheme === t" 
              class="absolute top-2 right-2 bg-primary text-primary-content rounded-full p-1"
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
interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'theme-changed': [theme: string]
}>()

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'forest', 'aqua',
  'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 
  'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 
  'night', 'coffee', 'winter'
]

const currentTheme = ref('dark')
const searchQuery = ref('')

const filteredThemes = computed(() => {
  if (!searchQuery.value) return themes
  return themes.filter(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

function selectTheme(theme: string) {
  currentTheme.value = theme
  emit('theme-changed', theme)
  emit('update:modelValue', false)
}

watch(() => currentTheme.value, (newTheme) => {
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
})

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved && themes.includes(saved)) {
    currentTheme.value = saved
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    currentTheme.value = prefersDark ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})

defineExpose({ currentTheme })
</script>