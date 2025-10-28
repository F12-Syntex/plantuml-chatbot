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
    />

    <ModelSelector 
      v-model="modelDrawerOpen"
      @model-changed="handleModelChanged"
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
const modelDrawerOpen = ref(false)
const selectedModel = ref('openai/gpt-5-mini')

function handleModelChanged(modelId: string) {
  selectedModel.value = modelId
}

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
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
    const response = await $fetch<{ choices: Array<{ message: { content: string } }> }>('/api/chat', {
      method: 'POST',
      body: {
        messages: messages.value,
        model: selectedModel.value
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
  
  const savedModel = localStorage.getItem('selected-model')
  if (savedModel) {
    selectedModel.value = savedModel
  }
})

watch(messages, () => nextTick(() => messageListEl.value?.scrollToBottom()))

defineExpose({ modelDrawerOpen })
</script>