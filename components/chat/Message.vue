<template>
  <div class="flex flex-col gap-3" :class="message.role === 'user' ? 'items-end' : 'items-start'">
    <div v-if="message.role === 'assistant'" class="flex flex-col gap-3 max-w-full lg:max-w-[85%]">
      <div class="avatar placeholder">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-secondary to-accent">
          <MdiRobotOutline class="text-lg sm:text-xl text-secondary-content" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 sm:p-5">
          <template v-if="extractPlantUml(message.content)">
            <p v-if="getTextBeforePlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
              {{ getTextBeforePlantUml(message.content) }}
            </p>
            <PlantUmlDiagram :code="extractPlantUml(message.content)!" />
            <p v-if="getTextAfterPlantUml(message.content)" class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mt-4">
              {{ getTextAfterPlantUml(message.content) }}
            </p>
          </template>
          <p v-else class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{{ message.content }}</p>
        </div>
        <div class="flex items-center gap-2 mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
          <div class="flex gap-1">
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
      <div class="flex-1 min-w-0">
        <div class="bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-2xl shadow-md p-4 sm:p-5">
          <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{{ message.content }}</p>
        </div>
        <div class="text-right mt-2 px-2">
          <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
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

async function copyMessage(text: string) {
  try {
    await navigator.clipboard.writeText(text)
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