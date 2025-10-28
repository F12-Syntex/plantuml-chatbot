<template>
  <div 
    v-if="modelValue" 
    class="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
    @click.self="close"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
    
    <div class="relative bg-base-100 rounded-t-3xl sm:rounded-3xl w-full sm:w-auto sm:min-w-[600px] max-w-3xl max-h-[85vh] sm:max-h-[80vh] shadow-2xl animate-slide-up sm:animate-scale-in">
      <div class="sticky top-0 bg-base-100 rounded-t-3xl sm:rounded-t-3xl z-10 border-b border-base-300 px-6 py-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl sm:text-2xl font-bold">{{ title }}</h3>
          <button @click="close" class="btn btn-ghost btn-sm btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <slot name="header"></slot>
      </div>

      <div class="overflow-y-auto px-6 py-4" style="max-height: calc(85vh - 160px);">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>