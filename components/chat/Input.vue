<template>
  <div class="border-t border-base-300 bg-base-100/95 backdrop-blur-lg sticky bottom-0">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <form @submit.prevent="handleSubmit" class="relative">
        <div class="flex gap-2 sm:gap-3 items-end">
          <div class="flex-1 relative">
            <textarea
              v-model="modelValue"
              rows="1"
              placeholder="Ask me to create a diagram..."
              @input="autoResize"
              @keydown.enter.exact.prevent="handleSubmit"
              ref="inputEl"
              class="textarea textarea-bordered w-full resize-none text-sm sm:text-base pr-12 sm:pr-24 py-3 sm:py-4 leading-relaxed focus:outline-none focus:border-primary transition-colors bg-base-100"
              :class="{'max-h-32 sm:max-h-40': true}"
              :disabled="disabled"
            />
            <div class="absolute bottom-3 right-3 flex items-center gap-2">
              <span class="text-xs text-base-content/40 hidden sm:inline">{{ modelValue.length }}/2000</span>
              <button
                v-if="modelValue.trim()"
                type="button"
                @click="modelValue = ''"
                class="btn btn-ghost btn-circle btn-xs"
              >
                <MdiClose class="h-4 w-4 text-base-content" />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            :disabled="!modelValue.trim() || disabled"
            class="btn btn-primary btn-circle sm:btn-md btn-sm shadow-lg hover:shadow-xl transition-all"
          >
            <MdiSend v-if="!disabled" class="h-5 w-5 sm:h-6 sm:w-6 text-primary-content" />
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </form>
      
      <div class="mt-3 flex items-center justify-center gap-4 text-xs text-base-content/50">
        <span class="hidden sm:inline flex items-center gap-1">
          <kbd class="kbd kbd-xs">Enter</kbd> to send
        </span>
        <span class="hidden sm:inline flex items-center gap-1">
          <kbd class="kbd kbd-xs">Shift</kbd> + <kbd class="kbd kbd-xs">Enter</kbd> for new line
        </span>
        <span class="sm:hidden">Tap send to submit</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiClose from '~icons/mdi/close'
import MdiSend from '~icons/mdi/send'

const modelValue = defineModel<string>({ required: true })

defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const inputEl = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    const maxHeight = window.innerWidth < 640 ? 128 : 160
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, maxHeight)}px`
  }
}

function handleSubmit() {
  if (modelValue.value.trim()) {
    emit('submit')
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
})
</script>