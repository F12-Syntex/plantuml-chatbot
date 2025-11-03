<template>
  <div class="collapse collapse-arrow bg-base-200 border border-base-300">
    <input type="checkbox" v-model="isOpen" /> 
    <div class="collapse-title text-sm font-medium flex items-center gap-2 text-base-content">
      <MdiCodeTags class="h-4 w-4" />
      <span>{{ title }}</span>
      <button 
        @click.stop="copyCode" 
        class="btn btn-ghost btn-xs ml-auto"
        :class="{'btn-success': copied}"
      >
        <MdiContentCopy v-if="!copied" class="h-3 w-3" />
        <MdiCheck v-else class="h-3 w-3" />
      </button>
    </div>
    <div class="collapse-content">
      <div class="bg-neutral text-neutral-content p-4 rounded-lg overflow-x-auto">
        <pre class="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">{{ code }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MdiCodeTags from '~icons/mdi/code-tags'
import MdiContentCopy from '~icons/mdi/content-copy'
import MdiCheck from '~icons/mdi/check'

const props = defineProps<{
  code: string
  title?: string
}>()

const isOpen = ref(false)
const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>