<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
      <ChatMessageList
        ref="messageListEl"
        :messages="messages"
        :sending="sending"
        :streaming-content="streamingContent"
        :generating-diagram="generatingDiagram"
        :generating-business-card="generatingBusinessCard"
        :on-delete="deleteMessage"
        @apply-suggestion="applySuggestion"
        @delete="deleteMessage"
      />
    <ChatInput 
      ref="inputEl"
      v-model="draft" 
      :disabled="sending"
      :chat-id="undefined"
      @submit="onSend"
      @reset="resetChat"
      @share="shareChat"
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

const router = useRouter()
const messages = ref<Message[]>([])
const draft = ref('')
const sending = ref(false)
const streamingContent = ref('')
const generatingDiagram = ref(false)
const generatingBusinessCard = ref(false)
const messageListEl = ref<{ scrollToBottom: () => void } | null>(null)
const inputEl = ref<{ focus: () => void; autoResize: () => void } | null>(null)

onMounted(() => {
  messageListEl.value?.scrollToBottom()
  inputEl.value?.focus()
})

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
  inputEl.value?.focus()
}

function deleteMessage(messageIndex: number) {
  if (messageIndex < 0 || messageIndex >= messages.value.length) {
    console.error('Invalid message index:', messageIndex)
    return
  }

  // Confirm deletion
  if (!confirm('Are you sure you want to delete this message?')) {
    return
  }

  // Remove from local array
  messages.value.splice(messageIndex, 1)
  messageListEl.value?.scrollToBottom()
}

function resetChat() {
  messages.value = []
  draft.value = ''
  streamingContent.value = ''
  generatingDiagram.value = false
  generatingBusinessCard.value = false
  inputEl.value?.focus()
}

async function shareChat() {
  if (messages.value.length === 0) {
    alert('No messages to share yet!')
    return
  }

  try {
    const response = await fetch('/api/chat/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value })
    })

    if (!response.ok) {
      throw new Error('Failed to create shareable chat')
    }

    const { id } = await response.json()
    const url = `${window.location.origin}/chat/${id}`
    
    // Update URL to include the chat ID
    await router.push(`/chat/${id}`)
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 z-50 bg-success text-success-content px-4 py-3 rounded-lg shadow-lg flex items-center gap-2'
      notification.style.transition = 'opacity 0.3s, transform 0.3s'
      notification.style.opacity = '0'
      notification.style.transform = 'translateY(-10px)'
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Chat link copied!</span>
      `
      document.body.appendChild(notification)
      requestAnimationFrame(() => {
        notification.style.opacity = '1'
        notification.style.transform = 'translateY(0)'
      })
      setTimeout(() => {
        notification.style.opacity = '0'
        notification.style.transform = 'translateY(-10px)'
        setTimeout(() => notification.remove(), 300)
      }, 2000)
    }).catch(err => {
      console.error('Failed to copy:', err)
      alert('Chat is now shareable! URL: ' + url)
    })
  } catch (error) {
    console.error('Failed to share chat:', error)
    alert('Failed to create shareable link. Please try again.')
  }
}

async function onSend(additionalInstructions: string) {
  const text = draft.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  streamingContent.value = ''
  generatingDiagram.value = false
  generatingBusinessCard.value = false
  
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
              generatingBusinessCard.value = false
              streamingContent.value = ''
            } else if (fullContent.includes('<!--BUSINESS_CARD_FRONT-->')) {
              generatingBusinessCard.value = true
              generatingDiagram.value = false
              streamingContent.value = ''
            } else if (!generatingDiagram.value && !generatingBusinessCard.value) {
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
      generatingBusinessCard.value = false
    }
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({ 
      role: 'assistant', 
      content: 'Sorry, there was an error generating the diagram. Please try again.' 
    })
    streamingContent.value = ''
    generatingDiagram.value = false
    generatingBusinessCard.value = false
  } finally {
    sending.value = false
  }
}

watch(messages, () => nextTick(() => messageListEl.value?.scrollToBottom()))
watch(streamingContent, () => nextTick(() => messageListEl.value?.scrollToBottom()))
watch(generatingDiagram, () => nextTick(() => messageListEl.value?.scrollToBottom()))
watch(generatingBusinessCard, () => nextTick(() => messageListEl.value?.scrollToBottom()))
</script>