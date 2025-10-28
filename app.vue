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
        <button @click="themeDrawerOpen = true" class="btn btn-ghost btn-square btn-sm sm:btn-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <NuxtPage />
    </div>

    <AppThemeSwitcher v-model="themeDrawerOpen" @theme-changed="currentTheme = $event" />
  </div>
</template>

<script setup lang="ts">
const currentTheme = ref('dark')
const themeDrawerOpen = ref(false)

watch(currentTheme, (newTheme) => {
  if (import.meta.client) {
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }
})

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
    'synthwave', 'retro', 'cyberpunk', 'valentine', 'forest', 'aqua',
    'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 
    'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 
    'night', 'coffee', 'winter'
  ]
  
  if (saved && themes.includes(saved)) {
    currentTheme.value = saved
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    currentTheme.value = prefersDark ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-theme', currentTheme.value)
})
</script>