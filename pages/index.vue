<template>
  <div class="h-full flex flex-col max-w-5xl mx-auto">
    <div class="flex-1 overflow-y-auto p-6 space-y-6" ref="messagesEl">
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full gap-4">
        <div class="text-6xl">💬</div>
        <h2 class="text-3xl font-bold">Start a Conversation</h2>
        <p class="text-base-content/60">Ask me to create PlantUML diagrams</p>
      </div>

      <div v-for="(m, i) in messages" :key="i" :class="m.role === 'user' ? 'chat chat-end' : 'chat chat-start'">
        <div class="chat-image avatar">
          <div class="w-12 rounded-full" :class="m.role === 'user' ? 'bg-primary' : 'bg-secondary'">
            <div class="flex items-center justify-center h-full text-xl">
              {{ m.role === 'user' ? '👤' : '🤖' }}
            </div>
          </div>
        </div>
        <div class="chat-bubble text-base" :class="m.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary'">
          <p class="whitespace-pre-wrap leading-relaxed">{{ m.content }}</p>
        </div>
      </div>

      <div v-if="sending" class="chat chat-start">
        <div class="chat-image avatar">
          <div class="w-12 rounded-full bg-secondary">
            <div class="flex items-center justify-center h-full text-xl">🤖</div>
          </div>
        </div>
        <div class="chat-bubble chat-bubble-secondary">
          <span class="loading loading-dots loading-md"></span>
        </div>
      </div>
    </div>

    <div class="p-6 bg-base-200 border-t border-base-300">
      <form @submit.prevent="onSend" class="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          v-model="draft"
          rows="1"
          placeholder="Type your message..."
          @input="autoResize"
          @keydown.enter.exact.prevent="onSend"
          ref="inputEl"
          class="textarea textarea-bordered flex-1 resize-none max-h-40 text-base"
        />
        <button
          type="submit"
          :disabled="!draft.trim() || sending"
          class="btn btn-primary btn-lg gap-2"
        >
          <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span v-if="sending" class="loading loading-spinner loading-md"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const draft = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

function scrollToBottom() {
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, 160)}px`
  }
}

async function onSend() {
  const text = draft.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  messages.value.push({ role: 'user', content: text })
  draft.value = ''
  
  await nextTick()
  scrollToBottom()
  autoResize()

  setTimeout(async () => {
    const sample = `Here's a sample PlantUML sequence diagram:

@startuml
actor User
participant "Web App" as App
participant "Server" as S

User -> App: Enter diagram request
App -> S: POST /render
S --> App: SVG URL
App --> User: Display diagram
@enduml

Note: This is a static response. Hook up your AI or rendering service to generate diagrams dynamically.`
    
    messages.value.push({ role: 'assistant', content: sample })
    await nextTick()
    scrollToBottom()
    sending.value = false
  }, 1000)
}

onMounted(() => {
  scrollToBottom()
  autoResize()
  inputEl.value?.focus()
})

watch(messages, () => nextTick(scrollToBottom))
</script>