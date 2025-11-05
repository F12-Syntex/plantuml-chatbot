<template>
  <div class="flex flex-col gap-3" :class="message.role === 'user' ? 'items-end' : 'items-start'">
    <div v-if="message.role === 'assistant'" class="flex flex-col gap-3 max-w-full lg:max-w-[85%]">
      <div class="avatar placeholder">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-secondary to-accent">
          <MdiRobotOutline class="text-lg sm:text-xl text-secondary-content" />
        </div>
      </div>
      <div class="flex-1 min-w-0 w-full">
        <div class="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 sm:p-5">
          <template v-if="extractBusinessCard(message.content)">
            <p v-if="getTextBeforeBusinessCard(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
              {{ getTextBeforeBusinessCard(message.content) }}
            </p>
            <div class="mb-4">
              <BusinessCard
                :front-code="extractBusinessCard(message.content)!.front"
                :back-code="extractBusinessCard(message.content)!.back"
              />
            </div>
            <p v-if="getTextAfterBusinessCard(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {{ getTextAfterBusinessCard(message.content) }}
            </p>
          </template>
          <template v-else-if="extractPlantUml(message.content)">
            <p v-if="getTextBeforePlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
              {{ getTextBeforePlantUml(message.content) }}
            </p>
            <div class="mb-4">
              <PlantUmlDiagram :code="extractPlantUml(message.content)!" />
            </div>
            <CodeBlock :code="extractPlantUml(message.content)!" title="PlantUML Code" class="mb-4" />
            <p v-if="getTextAfterPlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {{ getTextAfterPlantUml(message.content) }}
            </p>
          </template>
          <template v-else>
            <div v-if="getMessageImages(message.content).length > 0" class="flex flex-wrap gap-2 mb-3">
              <img 
                v-for="(imageUrl, idx) in getMessageImages(message.content)" 
                :key="idx"
                :src="imageUrl" 
                alt="Uploaded image"
                class="max-w-full max-h-64 rounded-lg border border-base-300 cursor-pointer hover:opacity-90 transition-opacity"
                @click="openImageModal(imageUrl)"
              />
            </div>
            <p v-if="getMessageText(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {{ getMessageText(message.content) }}
              <span v-if="isStreaming" class="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
            </p>
          </template>
        </div>
        <div class="flex items-center gap-2 mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
          <div v-if="!isStreaming" class="flex gap-1">
            <button @click="copyMessage(message.content)" class="btn btn-ghost btn-xs" title="Copy">
              <MdiContentCopy class="h-3 w-3 text-base-content" />
            </button>
            <button 
              v-if="onDelete && messageIndex !== undefined" 
              @click="handleDelete" 
              class="btn btn-ghost btn-xs text-error hover:bg-error/10" 
              title="Delete message"
            >
              <MdiDeleteOutline class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-3 max-w-full sm:max-w-[80%] lg:max-w-[70%]">
      <div class="avatar placeholder self-end">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80">
          <MdiAccount class="text-lg sm:text-xl text-primary-content" />
        </div>
      </div>
      <div class="flex-1 min-w-0 w-full">
        <div class="bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-2xl shadow-md p-4 sm:p-5">
          <template v-if="extractPlantUml(message.content)">
            <p v-if="getTextBeforePlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
              {{ getTextBeforePlantUml(message.content) }}
            </p>
            <div class="mb-4">
              <PlantUmlDiagram :code="extractPlantUml(message.content)!" />
            </div>
            <CodeBlock :code="extractPlantUml(message.content)!" title="PlantUML Code" class="mb-4" />
            <p v-if="getTextAfterPlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {{ getTextAfterPlantUml(message.content) }}
            </p>
          </template>
          <template v-else>
            <div v-if="getMessageImages(message.content).length > 0" class="flex flex-wrap gap-2 mb-3">
              <img 
                v-for="(imageUrl, idx) in getMessageImages(message.content)" 
                :key="idx"
                :src="imageUrl" 
                alt="Uploaded image"
                class="max-w-full max-h-64 rounded-lg border border-primary/30 cursor-pointer hover:opacity-90 transition-opacity"
                @click="openImageModal(imageUrl)"
              />
            </div>
            <p v-if="getMessageText(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
              {{ getMessageText(message.content) }}
            </p>
          </template>
        </div>
        <div class="flex items-center justify-end gap-2 mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
          <button @click="copyMessage(message.content)" class="btn btn-ghost btn-xs" title="Copy">
            <MdiContentCopy class="h-3 w-3 text-base-content" />
          </button>
          <button 
            v-if="onDelete && messageIndex !== undefined" 
            @click="handleDelete" 
            class="btn btn-ghost btn-xs text-error hover:bg-error/10" 
            title="Delete message"
          >
            <MdiDeleteOutline class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiRobotOutline from '~icons/mdi/robot-outline'
import MdiAccount from '~icons/mdi/account'
import MdiContentCopy from '~icons/mdi/content-copy'
import MdiDeleteOutline from '~icons/mdi/delete-outline'

interface Message {
  role: 'user' | 'assistant'
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>
}

const props = defineProps<{
  message: Message
  isStreaming?: boolean
  messageIndex?: number
  onDelete?: (index: number) => void
}>()

const emit = defineEmits<{
  delete: [index: number]
}>()

function handleDelete() {
  if (props.messageIndex !== undefined && props.onDelete) {
    props.onDelete(props.messageIndex)
  } else if (props.messageIndex !== undefined) {
    emit('delete', props.messageIndex)
  }
}

function getMessageText(content: Message['content']): string {
  if (typeof content === 'string') {
    return content
  }
  return content.filter(c => c.type === 'text').map(c => c.text || '').join('')
}

function getMessageImages(content: Message['content']): string[] {
  if (typeof content === 'string') {
    return []
  }
  return content.filter(c => c.type === 'image_url').map(c => c.image_url?.url || '').filter(Boolean)
}

function extractPlantUml(content: Message['content']): string | null {
  const text = getMessageText(content)
  const match = text.match(/@startuml[\s\S]*?@enduml/)
  return match ? match[0] : null
}

function getTextBeforePlantUml(content: Message['content']): string {
  const text = getMessageText(content)
  const match = text.match(/@startuml/)
  if (!match || match.index === undefined) return ''
  return text.substring(0, match.index).trim()
}

function getTextAfterPlantUml(content: Message['content']): string {
  const text = getMessageText(content)
  const match = text.match(/@enduml/)
  if (!match || match.index === undefined) return ''
  return text.substring(match.index + 8).trim()
}

function extractBusinessCard(content: Message['content']): { front: string; back: string } | null {
  const text = getMessageText(content)
  const frontMatch = text.match(/<!--BUSINESS_CARD_FRONT-->([\s\S]*?)<!--\/BUSINESS_CARD_FRONT-->/)
  const backMatch = text.match(/<!--BUSINESS_CARD_BACK-->([\s\S]*?)<!--\/BUSINESS_CARD_BACK-->/)

  if (frontMatch && backMatch) {
    return {
      front: frontMatch[1].trim(),
      back: backMatch[1].trim()
    }
  }
  return null
}

function getTextBeforeBusinessCard(content: Message['content']): string {
  const text = getMessageText(content)
  const match = text.match(/<!--BUSINESS_CARD_FRONT-->/)
  if (!match || match.index === undefined) return ''
  return text.substring(0, match.index).trim()
}

function getTextAfterBusinessCard(content: Message['content']): string {
  const text = getMessageText(content)
  const match = text.match(/<!--\/BUSINESS_CARD_BACK-->/)
  if (!match || match.index === undefined) return ''
  return text.substring(match.index + 29).trim()
}

async function copyMessage(content: Message['content']) {
  try {
    const text = typeof content === 'string' ? content : getMessageText(content)
    await navigator.clipboard.writeText(text)
    // Show a brief notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 z-50 bg-success text-success-content px-4 py-3 rounded-lg shadow-lg flex items-center gap-2'
    notification.style.transition = 'opacity 0.3s, transform 0.3s'
    notification.style.opacity = '0'
    notification.style.transform = 'translateY(-10px)'
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>Copied!</span>
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
    }, 1500)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

function openImageModal(imageUrl: string) {
  // Create modal overlay
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
  modal.style.transition = 'opacity 0.3s'
  modal.style.opacity = '0'
  
  const img = document.createElement('img')
  img.src = imageUrl
  img.className = 'max-w-full max-h-[90vh] rounded-lg shadow-2xl'
  img.alt = 'Full size image'
  
  modal.appendChild(img)
  document.body.appendChild(modal)
  
  // Fade in
  requestAnimationFrame(() => {
    modal.style.opacity = '1'
  })
  
  // Close on click
  modal.addEventListener('click', () => {
    modal.style.opacity = '0'
    setTimeout(() => modal.remove(), 300)
  })
  
  // Close on escape
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.style.opacity = '0'
      setTimeout(() => modal.remove(), 300)
      document.removeEventListener('keydown', handleEscape)
    }
  }
  document.addEventListener('keydown', handleEscape)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}
</script>