<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
    <div v-if="chatNotFound" class="flex-1 flex items-center justify-center">
      <div class="text-center max-w-md px-4">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-2xl font-bold mb-2">Chat Not Found</h2>
        <p class="text-base-content/70 mb-6">This chat doesn't exist or may have been deleted.</p>
        <button @click="resetChat" class="btn btn-primary">
          Start New Chat
        </button>
      </div>
    </div>
    <template v-else>
      <ChatMessageList
        ref="messageListEl"
        :messages="messages"
        :sending="sending"
        :streaming-content="streamingContent"
        :generating-diagram="generatingDiagram"
        :generating-business-card="generatingBusinessCard"
        @apply-suggestion="applySuggestion"
      />
      <ChatInput 
        ref="inputEl"
        v-model="draft" 
        :disabled="sending"
        :chat-id="chatId"
        @submit="onSend"
        @reset="resetChat"
        @share="shareChat"
      />
    </template>
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

const route = useRoute()
const router = useRouter()
const chatId = computed(() => route.params.id as string)

const messages = ref<Message[]>([])
const draft = ref('')
const sending = ref(false)
const streamingContent = ref('')
const generatingDiagram = ref(false)
const generatingBusinessCard = ref(false)
const messageListEl = ref<{ scrollToBottom: () => void } | null>(null)
const inputEl = ref<{ focus: () => void; autoResize: () => void } | null>(null)

const chatNotFound = ref(false)

// Load chat on mount
onMounted(async () => {
  await loadChat()
  messageListEl.value?.scrollToBottom()
  inputEl.value?.focus()
})

// Load chat from server
async function loadChat() {
  try {
    const response = await fetch(`/api/chat/${chatId.value}`)
    if (response.ok) {
      const chat = await response.json()
      messages.value = chat.messages || []
      chatNotFound.value = false
    } else if (response.status === 404) {
      chatNotFound.value = true
    }
  } catch (error) {
    console.error('Failed to load chat:', error)
    chatNotFound.value = true
  }
}

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
  inputEl.value?.focus()
}

async function resetChat() {
  messages.value = []
  draft.value = ''
  streamingContent.value = ''
  generatingDiagram.value = false
  generatingBusinessCard.value = false
  
  // Navigate back to home page for new chat
  await router.push('/')
  inputEl.value?.focus()
}

function shareChat() {
  // Chat already has an ID, just copy the link
  const url = `${window.location.origin}/chat/${chatId.value}`
  navigator.clipboard.writeText(url).then(() => {
    // Show a temporary notification
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
    // Trigger animation
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
    alert('Failed to copy link. Please copy manually: ' + url)
  })
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

