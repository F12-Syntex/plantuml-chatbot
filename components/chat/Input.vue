<template>
  <div class="border-t border-base-300/50 bg-gradient-to-t from-base-100 via-base-100/98 to-base-100/95 backdrop-blur-xl sticky bottom-0 shadow-2xl">
    <div class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <form @submit.prevent="handleSubmit" class="relative">
        <div class="flex gap-2 items-end">
          <div class="flex-1 relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div class="relative bg-base-200/80 rounded-2xl sm:rounded-3xl border border-base-300/50 group-focus-within:border-primary/50 transition-all duration-300 shadow-lg group-focus-within:shadow-2xl">
              <textarea
                v-model="modelValue"
                rows="1"
                placeholder="Describe your diagram idea..."
                @input="autoResize"
                @keydown.enter.exact.prevent="handleSubmit"
                ref="inputEl"
                class="w-full resize-none bg-transparent px-4 sm:px-6 py-3 sm:py-4 pr-10 sm:pr-28 text-sm sm:text-base leading-relaxed focus:outline-none placeholder:text-base-content/40 max-h-32 sm:max-h-48 rounded-2xl sm:rounded-3xl"
                :disabled="disabled"
              />
              <div class="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                <div v-if="modelValue.length > 0" class="badge badge-ghost badge-xs sm:badge-sm font-mono hidden sm:flex" :class="modelValue.length > 1800 ? 'badge-warning' : 'badge-ghost'">
                  {{ modelValue.length }}/2000
                </div>
                <button
                  v-if="modelValue.trim()"
                  type="button"
                  @click="clearInput"
                  class="btn btn-ghost btn-circle btn-xs sm:btn-sm hover:bg-base-300/50 transition-all"
                  title="Clear input"
                >
                  <MdiClose class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            :disabled="!modelValue.trim() || disabled"
            class="btn btn-primary btn-circle h-11 w-11 sm:h-14 sm:w-14 min-h-0 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100"
            :class="{'animate-pulse': disabled}"
            title="Send message"
          >
            <MdiSend v-if="!disabled" class="h-5 w-5 sm:h-6 sm:w-6" />
            <span v-else class="loading loading-spinner loading-sm sm:loading-md" />
          </button>

          <button
            type="button"
            @click="resetChat"
            class="btn btn-outline btn-circle h-11 w-11 sm:h-14 sm:w-14 min-h-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            :disabled="disabled"
            title="Reset chat"
          >
            <MdiRestart class="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
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
  submit: []
  reset: []
}>()

const inputEl = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    const maxHeight = window.innerWidth < 640 ? 128 : 192
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, maxHeight)}px`
  }
}

function handleSubmit() {
  if (modelValue.value.trim()) {
    emit('submit')
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

function focus() {
  inputEl.value?.focus()
}

defineExpose({ focus, autoResize })

watch(modelValue, autoResize)

onMounted(() => {
  autoResize()
  focus()
})
</script>