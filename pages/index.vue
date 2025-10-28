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

async function onSend() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  
  await nextTick()
  messageListEl.value?.scrollToBottom()
  inputEl.value?.autoResize()

  setTimeout(async () => {
    const sample = `Here's a sample PlantUML sequence diagram:

@startuml
actor User
participant "Web App" as App
participant "Server" as S
database "Database" as DB

User -> App: Enter diagram request
App -> S: POST /render
S -> DB: Fetch template
DB --> S: Return template
S --> App: SVG URL
App --> User: Display diagram
@enduml

This diagram shows the flow of a diagram generation request. You can customize it further by adding more participants, messages, or styling options.`
    
    messages.value.push({ role: 'assistant', content: sample })
    await nextTick()
    messageListEl.value?.scrollToBottom()
    sending.value = false
  }, 1500)
}

onMounted(() => {
  messageListEl.value?.scrollToBottom()
  inputEl.value?.focus()
})

watch(messages, () => nextTick(() => messageListEl.value?.scrollToBottom()))
</script>