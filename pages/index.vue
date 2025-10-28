<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
    <ChatMessageList 
      ref="messageListEl"
      :messages="messages" 
      :sending="sending"
      :streaming-content="streamingContent"
      :generating-diagram="generatingDiagram"
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
const streamingContent = ref('')
const generatingDiagram = ref(false)
const messageListEl = ref<{ scrollToBottom: () => void } | null>(null)
const inputEl = ref<{ focus: () => void; autoResize: () => void } | null>(null)

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
  inputEl.value?.focus()
}

function resetChat() {
  messages.value = []
  draft.value = ''
  streamingContent.value = ''
  generatingDiagram.value = false
  inputEl.value?.focus()
}

async function onSend(additionalInstructions: string) {
  const text = draft.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  streamingContent.value = ''
  generatingDiagram.value = false
  
  await nextTick()
  messageListEl.value?.scrollToBottom()
  inputEl.value?.autoResize()

  try {
    const selectedModel = localStorage.getItem('selected-model') || 'openai/gpt-4o-mini'
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value,
        model: selectedModel,
        additionalInstructions
      })
    })

    if (!response.ok || !response.body) {
      throw new Error('Stream failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            
            if (fullContent.includes('@startuml')) {
              generatingDiagram.value = true
              streamingContent.value = ''
            } else {
              streamingContent.value += content
            }
            
            await nextTick()
            messageListEl.value?.scrollToBottom()
          }
        } catch (e) {
          console.error('Parse error:', e)
        }
      }
    }

    if (fullContent) {
      messages.value.push({ role: 'assistant', content: fullContent })
      streamingContent.value = ''
      generatingDiagram.value = false
    }
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({ 
      role: 'assistant', 
      content: 'Sorry, there was an error generating the diagram. Please try again.' 
    })
    streamingContent.value = ''
    generatingDiagram.value = false
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  messageListEl.value?.scrollToBottom()
  inputEl.value?.focus()
})

watch(messages, () => nextTick(() => messageListEl.value?.scrollToBottom()))
watch(streamingContent, () => nextTick(() => messageListEl.value?.scrollToBottom()))
watch(generatingDiagram, () => nextTick(() => messageListEl.value?.scrollToBottom()))
</script>