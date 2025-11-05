<template>
  <div class="flex-1 overflow-y-auto" ref="messagesEl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <ChatWelcome v-if="messages.length === 0 && !streamingContent && !generatingDiagram && !generatingBusinessCard" @apply-suggestion="$emit('applySuggestion', $event)" />

      <div v-else class="space-y-6 sm:space-y-8">
        <ChatMessage 
          v-for="(m, i) in messages" 
          :key="i" 
          :message="m" 
          :message-index="i"
          :on-delete="onDelete"
          @delete="$emit('delete', $event)"
        />
        <ChatDiagramGenerating v-if="generatingDiagram" />
        <ChatBusinessCardGenerating v-else-if="generatingBusinessCard" />
        <ChatMessage
          v-else-if="streamingContent"
          :message="{ role: 'assistant', content: streamingContent }"
          :is-streaming="true"
        />
        <ChatThinking v-if="sending && !streamingContent && !generatingDiagram && !generatingBusinessCard" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>
}

defineProps<{
  messages: Message[]
  sending: boolean
  streamingContent?: string
  generatingDiagram?: boolean
  generatingBusinessCard?: boolean
  onDelete?: (index: number) => void
}>()

defineEmits<{
  applySuggestion: [suggestion: any]
  delete: [index: number]
}>()

const messagesEl = ref<HTMLElement | null>(null)

function scrollToBottom() {
  if (messagesEl.value) {
    setTimeout(() => {
      messagesEl.value?.scrollTo({
        top: messagesEl.value.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }
}

defineExpose({ scrollToBottom })
</script>