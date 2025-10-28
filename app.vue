<template>
  <div class="h-screen flex flex-col" :data-theme="currentTheme">
    <div class="navbar bg-base-300 shadow-lg">
      <div class="flex-1">
        <NuxtLink to="/" class="btn btn-ghost text-xl gap-2">
          <img src="/logo-nuxt.png" alt="Logo" class="h-10 w-10" />
          <span class="font-bold">PlantUML Chat</span>
        </NuxtLink>
      </div>
      <div class="flex-none gap-2">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Theme
          </label>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 max-h-96 overflow-y-auto">
            <li v-for="t in themes" :key="t">
              <a @click="currentTheme = t" :class="{ active: currentTheme === t }">{{ t }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-hidden">
      <NuxtPage />
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
</script>