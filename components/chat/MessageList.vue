<template>
  <div class="flex-1 overflow-y-auto" ref="messagesEl">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <ChatWelcome v-if="messages.length === 0 && !streamingContent" @apply-suggestion="$emit('applySuggestion', $event)" />
      
      <div v-else class="space-y-6 sm:space-y-8">
        <ChatMessage v-for="(m, i) in messages" :key="i" :message="m" />
        <ChatMessage 
          v-if="streamingContent" 
          :message="{ role: 'assistant', content: streamingContent }" 
          :is-streaming="true"
        />
        <ChatThinking v-if="sending && !streamingContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

defineProps<{
  messages: Message[]
  sending: boolean
  streamingContent?: string
}>()

defineEmits<{
  applySuggestion: [suggestion: any]
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