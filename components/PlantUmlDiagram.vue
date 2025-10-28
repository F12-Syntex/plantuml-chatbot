<template>
  <div class="plantuml-diagram-wrapper">
    <div class="card bg-base-100 border border-base-300 shadow-lg overflow-hidden">
      <DiagramHeader 
        :copied="copied"
        :image-copied="imageCopied"
        @theme="themeDrawerOpen = true"
        @copy="copyCode"
        @download="downloadImage"
        @copy-image="copyImage"
        @toggle-code="toggleCode"
        @view-online="viewOnline"
      />

      <!-- PlantUML Link Section -->
      <div class="border-b border-base-300 bg-base-50 px-4 py-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-base-content/70">PlantUML URL:</span>
          <a 
            :href="onlineViewUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-xs text-primary hover:text-primary-focus hover:underline font-mono truncate flex-1"
          >
            {{ onlineViewUrl }}
          </a>
          <button 
            @click="copyUrl"
            class="btn btn-xs btn-ghost"
            :class="{ 'btn-success': urlCopied }"
          >
            <svg v-if="!urlCopied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-4 bg-white relative overflow-x-auto max-w-full max-h-[40vh]">
        <div v-if="loading" class="flex flex-col items-center justify-center min-h-[200px] gap-3">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="text-sm text-base-content/60">Rendering diagram...</p>
        </div>
        <div v-else-if="error" class="alert alert-error shadow-lg max-w-md mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="font-bold">Rendering Error</h3>
            <p class="text-xs">{{ error }}</p>
          </div>
        </div>
        <div 
          v-else
          ref="diagramContainer" 
          class="w-full cursor-pointer"
          v-html="svgContent"
        />
      </div>

      <div v-if="showCode" class="border-t border-base-300">
        <div class="bg-base-300 px-4 py-2">
          <span class="text-xs font-mono text-base-content/70">PlantUML Source</span>
        </div>
        <div class="bg-neutral text-neutral-content p-4 overflow-x-auto">
          <pre class="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">{{ currentCode }}</pre>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div v-if="showToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <ThemeDrawer :model-value="editModalOpen" @update:model-value="editModalOpen = $event" title="Edit Element">
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Text</span>
          </label>
          <input 
            v-model="editingText" 
            type="text" 
            class="input input-bordered w-full"
            @keydown.enter="saveEdit"
          />
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button @click="cancelEdit" class="btn btn-ghost flex-1">Cancel</button>
        <button @click="saveEdit" class="btn btn-primary flex-1">Save Changes</button>
      </div>
    </ThemeDrawer>

    <DiagramThemeSettings 
      :model-value="themeDrawerOpen"
      @update:model-value="themeDrawerOpen = $event"
      @apply="applyTheme"
    />
  </div>
</template>

<script setup lang="ts">
import { encode } from 'plantuml-encoder'
import MaterialSymbolsRobot from '~icons/material-symbols/robot';

interface DiagramTheme {
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  borderColor: string
  arrowColor: string
}

interface Props {
  code: string
  altText?: string
}

const props = withDefaults(defineProps<Props>(), {
  altText: 'PlantUML Diagram'
})

const showCode = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const copied = ref(false)
const imageCopied = ref(false)
const urlCopied = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const currentCode = ref(props.code)
const svgContent = ref('')
const diagramContainer = ref<HTMLElement | null>(null)
const themeDrawerOpen = ref(false)
const editModalOpen = ref(false)

const editingElement = ref<Element | null>(null)
const editingText = ref('')
const originalText = ref('')

function encodeCode(code: string): string | null {
  try {
    return encode(code)
  } catch (e) {
    return null
  }
}

const encodedDiagram = computed(() => encodeCode(currentCode.value))

const imageUrl = computed(() => {
  if (!encodedDiagram.value) return ''
  // Standard Deflate compression (no prefix needed)
  return `https://www.plantuml.com/plantuml/svg/${encodedDiagram.value}`
})

const pngImageUrl = computed(() => {
  if (!encodedDiagram.value) return ''
  // Standard Deflate compression (no prefix needed)
  return `https://www.plantuml.com/plantuml/png/${encodedDiagram.value}`
})

const onlineViewUrl = computed(() => {
  if (!encodedDiagram.value) return ''
  // Standard Deflate compression (no prefix needed)
  return `https://www.plantuml.com/plantuml/uml/${encodedDiagram.value}`
})

function showToastNotification(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function viewOnline() {
  if (!onlineViewUrl.value) return
  window.open(onlineViewUrl.value, '_blank')
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(onlineViewUrl.value)
    urlCopied.value = true
    showToastNotification('URL copied to clipboard!')
    setTimeout(() => {
      urlCopied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy URL:', e)
    showToastNotification('Failed to copy URL')
  }
}

function applyTheme(theme: Partial<DiagramTheme>) {
  const lines = currentCode.value.split('\n')
  const hasTheme = lines.some(line => line.includes('skinparam'))
  
  // provide safe defaults for any missing values so the handler accepts partial payloads
  const t = {
    backgroundColor: theme.backgroundColor ?? 'transparent',
    primaryColor: theme.primaryColor ?? '#ffffff',
    secondaryColor: theme.secondaryColor ?? '#f3f4f6',
    textColor: theme.textColor ?? '#000000',
    borderColor: theme.borderColor ?? '#000000',
    arrowColor: theme.arrowColor ?? '#000000'
  }

  const themeLines = [
    `skinparam backgroundColor ${t.backgroundColor}`,
    `skinparam classBorderColor ${t.borderColor}`,
    `skinparam classBackgroundColor ${t.primaryColor}`,
    `skinparam sequenceParticipantBackgroundColor ${t.primaryColor}`,
    `skinparam sequenceParticipantBorderColor ${t.borderColor}`,
    `skinparam sequenceArrowColor ${t.arrowColor}`,
    `skinparam noteBorderColor ${t.borderColor}`,
    `skinparam noteBackgroundColor ${t.secondaryColor}`
  ]
  
  if (hasTheme) {
    const newLines = lines.filter(line => !line.includes('skinparam'))
    const startIndex = newLines.findIndex(line => line.includes('@startuml'))
    newLines.splice(startIndex + 1, 0, ...themeLines)
    currentCode.value = newLines.join('\n')
  } else {
    const startIndex = lines.findIndex(line => line.includes('@startuml'))
    lines.splice(startIndex + 1, 0, ...themeLines)
    currentCode.value = lines.join('\n')
  }
  
  loadDiagram()
}

function toggleCode() {
  showCode.value = !showCode.value
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(currentCode.value)
    copied.value = true
    showToastNotification('Code copied to clipboard!')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
    showToastNotification('Failed to copy code')
  }
}

async function downloadImage() {
  if (!pngImageUrl.value) return
  
  try {
    const response = await fetch(pngImageUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    showToastNotification('Image downloaded successfully!')
  } catch (e) {
    console.error('Failed to download:', e)
    showToastNotification('Failed to download image')
  }
}

async function copyImage() {
  if (!pngImageUrl.value) return
  
  try {
    const response = await fetch(pngImageUrl.value)
    const blob = await response.blob()
    
    // Convert to PNG if not already
    const item = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([item])
    
    imageCopied.value = true
    showToastNotification('Image copied to clipboard!')
    setTimeout(() => {
      imageCopied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy image:', e)
    
    // Fallback: try using canvas to convert SVG to PNG
    try {
      const svgResponse = await fetch(imageUrl.value)
      const svgText = await svgResponse.text()
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)))
      })
      
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([item])
          imageCopied.value = true
          showToastNotification('Image copied to clipboard!')
          setTimeout(() => {
            imageCopied.value = false
          }, 2000)
        }
      }, 'image/png')
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      showToastNotification('Failed to copy image to clipboard')
    }
  }
}

function findTextInCode(text: string): number {
  const lines = currentCode.value.split('\n')
  return lines.findIndex(line => {
    const trimmedLine = line.trim()
    return trimmedLine.includes(text) && !trimmedLine.startsWith('skinparam') && !trimmedLine.startsWith('@')
  })
}

function setupClickHandlers() {
  if (!diagramContainer.value) return
  
  nextTick(() => {
    const textElements = diagramContainer.value?.querySelectorAll('text')
    textElements?.forEach(textEl => {
      textEl.style.cursor = 'pointer'
      textEl.addEventListener('click', (e) => {
        e.stopPropagation()
        const text = textEl.textContent?.trim()
        if (!text) return
        
        originalText.value = text
        editingText.value = text
        editingElement.value = textEl
        editModalOpen.value = true
      })
    })
  })
}

function saveEdit() {
  if (!originalText.value || !editingText.value) return
  
  const lines = currentCode.value.split('\n')
  const lineIndex = findTextInCode(originalText.value)
  
  if (lineIndex !== -1) {
    const oldLine = lines[lineIndex]
    if (oldLine) {
      lines[lineIndex] = oldLine.replace(originalText.value, editingText.value)
      currentCode.value = lines.join('\n')
      loadDiagram()
    }
  }
  
  cancelEdit()
}

function cancelEdit() {
  editModalOpen.value = false
  editingElement.value = null
  editingText.value = ''
  originalText.value = ''
}

async function loadDiagram() {
  if (!imageUrl.value) {
    error.value = 'Invalid PlantUML code'
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(imageUrl.value)
    if (!response.ok) throw new Error('Failed to load diagram')
    
    const svg = await response.text()
    svgContent.value = svg
    loading.value = false
    setupClickHandlers()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    loading.value = false
  }
}

watch(() => props.code, (newCode) => {
  currentCode.value = newCode
  loadDiagram()
}, { immediate: true })
</script>