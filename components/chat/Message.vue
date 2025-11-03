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
          <p v-else class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
            {{ message.content }}
            <span v-if="isStreaming" class="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
          </p>
        </div>
        <div class="flex items-center gap-2 mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
          <div v-if="!isStreaming" class="flex gap-1">
            <button @click="copyMessage(message.content)" class="btn btn-ghost btn-xs" title="Copy">
              <MdiContentCopy class="h-3 w-3 text-base-content" />
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
          <p v-else class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{{ message.content }}</p>
        </div>
        <div class="flex items-center justify-end gap-2 mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
          <button @click="copyMessage(message.content)" class="btn btn-ghost btn-xs" title="Copy">
            <MdiContentCopy class="h-3 w-3 text-base-content" />
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

interface Message {
  role: 'user' | 'assistant'
  content: string
}

defineProps<{
  message: Message
  isStreaming?: boolean
}>()

function extractPlantUml(content: string): string | null {
  const match = content.match(/@startuml[\s\S]*?@enduml/)
  return match ? match[0] : null
}

function getTextBeforePlantUml(content: string): string {
  const match = content.match(/@startuml/)
  if (!match || match.index === undefined) return ''
  return content.substring(0, match.index).trim()
}

function getTextAfterPlantUml(content: string): string {
  const match = content.match(/@enduml/)
  if (!match || match.index === undefined) return ''
  return content.substring(match.index + 8).trim()
}

function extractBusinessCard(content: string): { front: string; back: string } | null {
  const frontMatch = content.match(/<!--BUSINESS_CARD_FRONT-->([\s\S]*?)<!--\/BUSINESS_CARD_FRONT-->/)
  const backMatch = content.match(/<!--BUSINESS_CARD_BACK-->([\s\S]*?)<!--\/BUSINESS_CARD_BACK-->/)

  if (frontMatch && backMatch) {
    return {
      front: frontMatch[1].trim(),
      back: backMatch[1].trim()
    }
  }
  return null
}

function getTextBeforeBusinessCard(content: string): string {
  const match = content.match(/<!--BUSINESS_CARD_FRONT-->/)
  if (!match || match.index === undefined) return ''
  return content.substring(0, match.index).trim()
}

function getTextAfterBusinessCard(content: string): string {
  const match = content.match(/<!--\/BUSINESS_CARD_BACK-->/)
  if (!match || match.index === undefined) return ''
  return content.substring(match.index + 29).trim()
}

async function copyMessage(text: string) {
  try {
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}
</script>