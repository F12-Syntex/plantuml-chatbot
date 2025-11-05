<template>
  <div class="border-t border-base-300/50 bg-gradient-to-t from-base-100 via-base-100/98 to-base-100/95 backdrop-blur-xl sticky bottom-0 shadow-2xl">
    <div class="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-6">
      <div v-if="showInstructions" class="mb-2 sm:mb-3">
        <div class="collapse collapse-arrow bg-base-200/80 border border-base-300/50 rounded-xl sm:rounded-2xl">
          <input type="checkbox" v-model="instructionsExpanded" />
          <div class="collapse-title text-xs sm:text-sm font-medium flex items-center gap-2 py-2 sm:py-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Additional Instructions
          </div>
          <div class="collapse-content px-2 sm:px-4">
            <textarea
              v-model="additionalInstructions"
              placeholder="1: always troubleshoot, if successful go to the next instruction else rollback&#10;2: no side notes, notes are to be added in the node itself&#10;3: all con as WDPI-CON. All ctr as WDPI-CTR"
              rows="3"
              class="textarea textarea-bordered w-full text-xs font-mono"
              @input="saveInstructions"
            />
            <div class="flex gap-2 mt-2">
              <button type="button" @click="clearInstructions" class="btn btn-ghost btn-xs">Clear</button>
              <button type="button" @click="resetToDefault" class="btn btn-ghost btn-xs">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Image previews -->
      <div v-if="imagePreviews.length > 0" class="mb-2 sm:mb-3 flex flex-wrap gap-2">
        <div v-for="(preview, index) in imagePreviews" :key="index" class="relative group">
          <img :src="preview.url" :alt="preview.name" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-base-300" />
          <button
            type="button"
            @click="removeImage(index)"
            class="absolute -top-2 -right-2 btn btn-circle btn-xs bg-error text-error-content border-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <MdiClose class="h-3 w-3" />
          </button>
          <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded-b-lg truncate">
            {{ preview.name }}
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="relative">
        <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div class="flex-1 relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl sm:rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div class="relative bg-base-200/80 rounded-xl sm:rounded-3xl border border-base-300/50 group-focus-within:border-primary/50 transition-all duration-300 shadow-lg group-focus-within:shadow-2xl">
              <textarea
                v-model="modelValue"
                rows="1"
                placeholder="Describe your diagram idea..."
                @input="autoResize"
                @keydown.enter.exact.prevent="handleSubmit"
                @paste="handlePaste"
                ref="inputEl"
                class="w-full resize-none bg-transparent px-3 sm:px-6 py-2.5 sm:py-4 pr-9 sm:pr-28 text-sm sm:text-base leading-relaxed focus:outline-none placeholder:text-base-content/40 max-h-28 sm:max-h-48 rounded-xl sm:rounded-3xl"
                :disabled="disabled"
              />
              <div class="absolute bottom-1.5 sm:bottom-3 right-1.5 sm:right-3 flex items-center gap-1 sm:gap-2">
                <div v-if="modelValue.length > 0" class="badge badge-ghost badge-xs font-mono hidden sm:flex" :class="modelValue.length > 1800 ? 'badge-warning' : 'badge-ghost'">
                  {{ modelValue.length }}
                </div>
                <button
                  v-if="modelValue.trim() || imagePreviews.length > 0"
                  type="button"
                  @click="clearInput"
                  class="btn btn-ghost btn-circle btn-xs hover:bg-base-300/50 transition-all"
                  title="Clear"
                >
                  <MdiClose class="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex gap-1 sm:gap-1.5 justify-end sm:justify-start flex-shrink-0">
            <input
              ref="fileInputEl"
              type="file"
              accept="image/*"
              multiple
              @change="handleFileSelect"
              class="hidden"
            />
            <button
              type="button"
              @click="fileInputEl?.click()"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :disabled="disabled"
              title="Upload image"
            >
              <MdiImageOutline class="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              type="submit"
              :disabled="(!modelValue.trim() && imagePreviews.length === 0) || disabled"
              class="btn btn-primary btn-circle h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 min-h-0 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100"
              :class="{'animate-pulse': disabled}"
              title="Send"
            >
              <MdiSend v-if="!disabled" class="h-4 w-4 sm:h-5 sm:w-5" />
              <span v-else class="loading loading-spinner loading-xs sm:loading-sm" />
            </button>

            <button
              type="button"
              @click="toggleInstructions"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :class="{'btn-active': showInstructions}"
              :disabled="disabled"
              title="Instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            <button
              type="button"
              @click="shareChat"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :disabled="disabled"
              :title="chatId ? 'Share' : 'Make shareable'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            <button
              type="button"
              @click="resetChat"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :disabled="disabled"
              title="Reset"
            >
              <MdiRestart class="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiClose from '~icons/mdi/close'
import MdiSend from '~icons/mdi/send'
import MdiRestart from '~icons/mdi/restart'
import MdiImageOutline from '~icons/mdi/image-outline'

interface ImagePreview {
  url: string
  name: string
  base64: string
  type: string
}

const modelValue = defineModel<string>({ required: true })

defineProps<{
  disabled: boolean
  chatId?: string
}>()

const emit = defineEmits<{
  submit: [instructions: string, images: ImagePreview[]]
  reset: []
  share: []
}>()

const inputEl = ref<HTMLTextAreaElement | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)
const showInstructions = ref(false)
const instructionsExpanded = ref(false)
const additionalInstructions = ref('')
const imagePreviews = ref<ImagePreview[]>([])

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGES = 10

const DEFAULT_INSTRUCTIONS = `1: always troubleshoot, if successful go to the next instruction else rollback
2: no side notes, notes are to be added in the node itself
3: all con as WDPI-CON. All ctr as WDPI-CTR
4: don't change the colour or theme, please keep the formatting simple and consistent`

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    const maxHeight = window.innerWidth < 640 ? 112 : 192
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, maxHeight)}px`
  }
}

async function handlePaste(event: ClipboardEvent) {
  const clipboardData = event.clipboardData
  if (!clipboardData) return

  // Check for pasted images first
  const items = Array.from(clipboardData.items)
  const imageItem = items.find(item => item.type.startsWith('image/'))
  
  if (imageItem) {
    event.preventDefault()
    const file = imageItem.getAsFile()
    if (file) {
      if (imagePreviews.value.length >= MAX_IMAGES) {
        alert(`Maximum ${MAX_IMAGES} images allowed`)
        return
      }
      
      if (file.size > MAX_IMAGE_SIZE) {
        alert('Image is too large. Maximum size is 10MB')
        return
      }

      try {
        const base64 = await fileToBase64(file)
        const preview: ImagePreview = {
          url: URL.createObjectURL(file),
          name: file.name || 'pasted-image.png',
          base64,
          type: file.type
        }
        imagePreviews.value.push(preview)
      } catch (error) {
        console.error('Error processing pasted image:', error)
        alert('Failed to process pasted image')
      }
    }
    return
  }

  // Handle text paste
  const pastedText = clipboardData.getData('text')
  if (!pastedText) return

  // Check if pasted text looks like PlantUML code (contains PlantUML keywords but not wrapped)
  const isPlantUmlLike = (
    (pastedText.includes('@start') && pastedText.includes('@end')) ||
    (pastedText.includes('->') && pastedText.includes(':')) ||
    (pastedText.includes('participant') || pastedText.includes('actor') || pastedText.includes('entity')) ||
    (pastedText.includes('class') && pastedText.includes('{')) ||
    (pastedText.includes('skinparam') || pastedText.includes('title'))
  ) && !pastedText.includes('@startuml')

  if (isPlantUmlLike) {
    event.preventDefault()
    const selectionStart = inputEl.value?.selectionStart || 0
    const selectionEnd = inputEl.value?.selectionEnd || 0
    const currentValue = modelValue.value
    const before = currentValue.substring(0, selectionStart)
    const after = currentValue.substring(selectionEnd)
    
    // Wrap with @startuml/@enduml if not already wrapped
    const wrappedCode = pastedText.includes('@startuml') 
      ? pastedText 
      : `@startuml\n${pastedText.trim()}\n@enduml`
    
    modelValue.value = before + wrappedCode + after
    
    nextTick(() => {
      if (inputEl.value) {
        const newCursorPos = selectionStart + wrappedCode.length
        inputEl.value.setSelectionRange(newCursorPos, newCursorPos)
        autoResize()
      }
    })
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  const remainingSlots = MAX_IMAGES - imagePreviews.value.length
  if (remainingSlots <= 0) {
    alert(`Maximum ${MAX_IMAGES} images allowed`)
    return
  }

  const filesToProcess = Array.from(files).slice(0, remainingSlots)

  for (const file of filesToProcess) {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`)
      continue
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert(`${file.name} is too large. Maximum size is 10MB`)
      continue
    }

    try {
      const base64 = await fileToBase64(file)
      const preview: ImagePreview = {
        url: URL.createObjectURL(file),
        name: file.name,
        base64,
        type: file.type
      }
      imagePreviews.value.push(preview)
    } catch (error) {
      console.error('Error processing image:', error)
      alert(`Failed to process ${file.name}`)
    }
  }

  // Reset file input
  if (target) {
    target.value = ''
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/...;base64, prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function removeImage(index: number) {
  const preview = imagePreviews.value[index]
  if (preview.url.startsWith('blob:')) {
    URL.revokeObjectURL(preview.url)
  }
  imagePreviews.value.splice(index, 1)
}

function handleSubmit() {
  if (modelValue.value.trim() || imagePreviews.value.length > 0) {
    emit('submit', additionalInstructions.value, imagePreviews.value)
    // Clear images after submit
    imagePreviews.value.forEach(preview => {
      if (preview.url.startsWith('blob:')) {
        URL.revokeObjectURL(preview.url)
      }
    })
    imagePreviews.value = []
  }
}

function clearInput() {
  modelValue.value = ''
  // Clear images
  imagePreviews.value.forEach(preview => {
    if (preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url)
    }
  })
  imagePreviews.value = []
  nextTick(() => autoResize())
}

function resetChat() {
  emit('reset')
  clearInput()
}

function shareChat() {
  emit('share')
}

function toggleInstructions() {
  showInstructions.value = !showInstructions.value
  if (showInstructions.value) {
    instructionsExpanded.value = true
  }
}

function clearInstructions() {
  additionalInstructions.value = ''
  saveInstructions()
}

function resetToDefault() {
  additionalInstructions.value = DEFAULT_INSTRUCTIONS
  saveInstructions()
}

function saveInstructions() {
  if (import.meta.client) {
    localStorage.setItem('additionalInstructions', additionalInstructions.value)
  }
}

function loadInstructions() {
  if (import.meta.client) {
    const saved = localStorage.getItem('additionalInstructions')
    if (saved) {
      additionalInstructions.value = saved
    } else {
      additionalInstructions.value = DEFAULT_INSTRUCTIONS
    }
  }
}

function focus() {
  inputEl.value?.focus()
}

defineExpose({ focus, autoResize })

watch(modelValue, autoResize)

onMounted(() => {
  autoResize()
  focus()
  loadInstructions()
})
</script>