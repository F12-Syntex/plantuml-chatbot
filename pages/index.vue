<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
    <ChatMessageList 
      ref="messageListEl"
      :messages="messages" 
      :sending="sending"
      @apply-suggestion="applySuggestion"
    />
    <ChatInput 
      ref="inputEl"
      v-model="draft" 
      :disabled="sending"
      @submit="onSend"
      @reset="resetChat"
    />
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Suggestion {
  icon: Component
  title: string
  description: string
  prompt: string
}

const messages = ref<Message[]>([])
const draft = ref('')
const sending = ref(false)
const messageListEl = ref<{ scrollToBottom: () => void } | null>(null)
const inputEl = ref<{ focus: () => void; autoResize: () => void } | null>(null)

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
  inputEl.value?.focus()
}

function resetChat() {
  messages.value = []
  draft.value = ''
  inputEl.value?.focus()
}

async function onSend() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  
  await nextTick()
  messageListEl.value?.scrollToBottom()
  inputEl.value?.autoResize()

  try {
    const selectedModel = localStorage.getItem('selected-model') || 'openai/gpt-5-mini'
    const response = await $fetch<{ choices: Array<{ message: { content: string } }> }>('/api/chat', {
      method: 'POST',
      body: {
        messages: messages.value,
        model: selectedModel
      }
    })
    
    const content = response.choices[0]?.message?.content
    if (content) {
      messages.value.push({ role: 'assistant', content })
      await nextTick()
      messageListEl.value?.scrollToBottom()
    }
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({ 
      role: 'assistant', 
      content: 'Sorry, there was an error generating the diagram. Please try again.' 
    })
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  messageListEl.value?.scrollToBottom()
  inputEl.value?.focus()
})

watch(messages, () => nextTick(() => messageListEl.value?.scrollToBottom()))
</script>