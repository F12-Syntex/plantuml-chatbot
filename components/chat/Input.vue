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
                ref="inputEl"
                class="w-full resize-none bg-transparent px-3 sm:px-6 py-2.5 sm:py-4 pr-9 sm:pr-28 text-sm sm:text-base leading-relaxed focus:outline-none placeholder:text-base-content/40 max-h-28 sm:max-h-48 rounded-xl sm:rounded-3xl"
                :disabled="disabled"
              />
              <div class="absolute bottom-1.5 sm:bottom-3 right-1.5 sm:right-3 flex items-center gap-1 sm:gap-2">
                <div v-if="modelValue.length > 0" class="badge badge-ghost badge-xs font-mono hidden sm:flex" :class="modelValue.length > 1800 ? 'badge-warning' : 'badge-ghost'">
                  {{ modelValue.length }}
                </div>
                <button
                  v-if="modelValue.trim()"
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
          
          <div class="flex gap-1.5 sm:gap-2 justify-end sm:justify-start">
            <button
              type="submit"
              :disabled="!modelValue.trim() || disabled"
              class="btn btn-primary btn-circle h-9 w-9 sm:h-14 sm:w-14 min-h-0 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100"
              :class="{'animate-pulse': disabled}"
              title="Send"
            >
              <MdiSend v-if="!disabled" class="h-4 w-4 sm:h-6 sm:w-6" />
              <span v-else class="loading loading-spinner loading-xs sm:loading-md" />
            </button>

            <button
              type="button"
              @click="toggleInstructions"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-14 sm:w-14 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :class="{'btn-active': showInstructions}"
              :disabled="disabled"
              title="Instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            <button
              type="button"
              @click="resetChat"
              class="btn btn-outline btn-circle h-9 w-9 sm:h-14 sm:w-14 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              :disabled="disabled"
              title="Reset"
            >
              <MdiRestart class="h-4 w-4 sm:h-6 sm:w-6" />
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

const modelValue = defineModel<string>({ required: true })

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  submit: [instructions: string]
  reset: []
}>()

const inputEl = ref<HTMLTextAreaElement | null>(null)
const showInstructions = ref(false)
const instructionsExpanded = ref(false)
const additionalInstructions = ref('')

const DEFAULT_INSTRUCTIONS = `1: always troubleshoot, if successful go to the next instruction else rollback
2: no side notes, notes are to be added in the node itself
3: all con as WDPI-CON. All ctr as WDPI-CTR`

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    const maxHeight = window.innerWidth < 640 ? 112 : 192
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, maxHeight)}px`
  }
}

function handleSubmit() {
  if (modelValue.value.trim()) {
    emit('submit', additionalInstructions.value)
  }
}

function clearInput() {
  modelValue.value = ''
  nextTick(() => autoResize())
}

function resetChat() {
  emit('reset')
  clearInput()
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