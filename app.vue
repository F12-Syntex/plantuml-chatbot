<template>
  <div class="h-screen flex flex-col" :data-theme="currentTheme">
    <div class="navbar bg-base-300 shadow-lg px-2 sm:px-4">
      <div class="flex-1 min-w-0">
        <NuxtLink to="/" class="btn btn-ghost normal-case gap-2 px-2 sm:px-4">
          <img src="/logo-nuxt.png" alt="Logo" class="h-8 w-8 sm:h-10 sm:w-10" />
          <span class="font-bold text-base sm:text-xl hidden xs:inline">PlantUML Chat</span>
          <span class="font-bold text-base sm:text-xl xs:hidden">PML</span>
        </NuxtLink>
      </div>
      <div class="flex-none">
        <button @click="toggleThemeDrawer" class="btn btn-ghost btn-square btn-sm sm:btn-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <NuxtPage />
    </div>

    <div 
      v-if="themeDrawerOpen" 
      class="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      @click.self="closeThemeDrawer"
    >
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeThemeDrawer"></div>
      
      <div class="relative bg-base-100 rounded-t-3xl sm:rounded-3xl w-full sm:w-auto sm:min-w-[600px] max-w-3xl max-h-[85vh] sm:max-h-[80vh] shadow-2xl animate-slide-up sm:animate-scale-in">
        <div class="sticky top-0 bg-base-100 rounded-t-3xl sm:rounded-t-3xl z-10 border-b border-base-300 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl sm:text-2xl font-bold">Choose Theme</h3>
            <button @click="closeThemeDrawer" class="btn btn-ghost btn-sm btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mt-3">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search themes..." 
              class="input input-bordered w-full"
            />
          </div>
        </div>

        <div class="overflow-y-auto px-6 py-4" style="max-height: calc(85vh - 160px);">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'forest', 'aqua',
  'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 
  'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 
  'night', 'coffee', 'winter'
]

const currentTheme = ref('dark')
const themeDrawerOpen = ref(false)
const searchQuery = ref('')

const filteredThemes = computed(() => {
  if (!searchQuery.value) return themes
  return themes.filter(t => t.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

function toggleThemeDrawer() {
  themeDrawerOpen.value = !themeDrawerOpen.value
  if (themeDrawerOpen.value) {
    searchQuery.value = ''
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeThemeDrawer() {
  themeDrawerOpen.value = false
  document.body.style.overflow = ''
}

function selectTheme(theme: string) {
  currentTheme.value = theme
  closeThemeDrawer()
}

watch(currentTheme, (newTheme) => {
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

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>