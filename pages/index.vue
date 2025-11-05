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
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>
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

async function onSend(additionalInstructions: string, images: Array<{ url: string; name: string; base64: string; type: string }> = []) {
  const text = draft.value.trim()
  if ((!text && images.length === 0) || sending.value) return
  
  sending.value = true
  
  // Format message with images if present
  let messageContent: Message['content']
  if (images.length > 0) {
    const contentParts: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = []
    if (text) {
      contentParts.push({ type: 'text', text })
    }
    for (const image of images) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: `data:${image.type};base64,${image.base64}`
        }
      })
    }
    messageContent = contentParts
  } else {
    messageContent = text
  }
  
  messages.value.push({ role: 'user', content: messageContent })
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
      const errorText = await response.text().catch(() => '')
      let errorMessage = 'Failed to get response from the server'
      let isImageError = false
      
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
        isImageError = errorData.data?.isImageError || false
      } catch {
        // If not JSON, try to extract error message
        if (errorText) {
          errorMessage = errorText
          isImageError = errorText.toLowerCase().includes('image') || 
                        errorText.toLowerCase().includes('vision') ||
                        errorText.toLowerCase().includes('multimodal')
        }
      }
      
      if (isImageError) {
        throw new Error(`The selected model doesn't support images. Please try a vision-capable model like GPT-4o, GPT-4 Vision, or Claude 3.5 Sonnet. Error: ${errorMessage}`)
      } else {
        throw new Error(errorMessage)
      }
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
          
          // Check for error messages from server
          if (parsed.type === 'error') {
            const errorMessage = parsed.error || 'Unknown error'
            const isImageError = parsed.isImageError || false
            
            if (isImageError) {
              throw new Error(`The selected model doesn't support images. Please try a vision-capable model like GPT-4o, GPT-4 Vision, or Claude 3.5 Sonnet.`)
            } else {
              throw new Error(errorMessage)
            }
          }
          
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
        } catch (parseError) {
          console.error('Parse error:', parseError)
          // Check if this is an error message in the stream
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              const errorMessage = parsed.error.message || 'Unknown error'
              const isImageError = errorMessage.toLowerCase().includes('image') ||
                                  errorMessage.toLowerCase().includes('vision') ||
                                  errorMessage.toLowerCase().includes('multimodal') ||
                                  errorMessage.toLowerCase().includes('does not support')
              
              if (isImageError) {
                throw new Error(`The selected model doesn't support images. Please try a vision-capable model like GPT-4o, GPT-4 Vision, or Claude 3.5 Sonnet.`)
              } else {
                throw new Error(errorMessage)
              }
            }
          } catch {
            // Not an error object, continue
          }
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
    const errorMessage = error instanceof Error ? error.message : 'Sorry, there was an error generating the response. Please try again.'
    
    // Check if it's an image-related error
    const isImageError = errorMessage.toLowerCase().includes('image') ||
                        errorMessage.toLowerCase().includes('vision') ||
                        errorMessage.toLowerCase().includes('doesn\'t support images')
    
    messages.value.push({ 
      role: 'assistant', 
      content: isImageError 
        ? errorMessage 
        : 'Sorry, there was an error generating the response. Please try again.'
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