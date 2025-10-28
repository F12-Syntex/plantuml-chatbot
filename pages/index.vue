<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-base-100 to-base-200">
    <!-- Messages Container -->
    <div class="flex-1 overflow-y-auto" ref="messagesEl">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Empty State -->
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
          <div class="text-center space-y-4 mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
              <span class="text-5xl sm:text-6xl">📊</span>
            </div>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Let's Create Diagrams
            </h2>
            <p class="text-sm sm:text-base lg:text-lg text-base-content/70 max-w-lg mx-auto px-4 py-4">
              Transform your ideas into beautiful PlantUML diagrams. Just describe what you need!
            </p>
          </div>
          
          <!-- Quick Start Suggestions - Desktop -->
          <div class="hidden md:grid grid-cols-2 gap-3 lg:gap-4 w-full max-w-3xl">
            <button 
              v-for="(suggestion, idx) in suggestions" 
              :key="idx"
              @click="applySuggestion(suggestion)"
              class="group card bg-base-100 hover:bg-base-200 border border-base-300 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div class="card-body p-4 lg:p-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span class="text-xl">{{ suggestion.icon }}</span>
                  </div>
                  <div class="text-left flex-1">
                    <h3 class="font-semibold text-sm lg:text-base mb-1 group-hover:text-primary transition-colors">
                      {{ suggestion.title }}
                    </h3>
                    <p class="text-xs lg:text-sm text-base-content/60 line-clamp-2">
                      {{ suggestion.description }}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          </div>

          <!-- Quick Start Suggestions - Mobile -->
          <div class="md:hidden w-full max-w-md space-y-2">
            <button 
              v-for="(suggestion, idx) in suggestions" 
              :key="idx"
              @click="applySuggestion(suggestion)"
              class="btn btn-outline w-full justify-start gap-3 h-auto py-3 px-4 normal-case"
            >
              <span class="text-2xl">{{ suggestion.icon }}</span>
              <div class="text-left flex-1">
                <div class="font-semibold text-sm">{{ suggestion.title }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div v-else class="space-y-6 sm:space-y-8">
          <div 
            v-for="(m, i) in messages" 
            :key="i" 
            class="flex gap-3 sm:gap-4"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- Assistant Message -->
            <div v-if="m.role === 'assistant'" class="flex gap-3 sm:gap-4 max-w-full lg:max-w-[85%]">
              <div class="avatar placeholder flex-shrink-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-secondary to-accent">
                  <span class="text-lg sm:text-xl">🤖</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="bg-base-100 border border-base-300 rounded-2xl rounded-tl-md shadow-sm p-4 sm:p-5">
                  <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{{ m.content }}</p>
                </div>
                <div class="flex items-center gap-2 mt-2 px-2">
                  <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
                  <div class="flex gap-1">
                    <button class="btn btn-ghost btn-xs" title="Copy">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- User Message -->
            <div v-else class="flex gap-3 sm:gap-4 max-w-full sm:max-w-[80%] lg:max-w-[70%]">
              <div class="flex-1 min-w-0">
                <div class="bg-gradient-to-br from-primary to-primary/90 text-primary-content rounded-2xl rounded-tr-md shadow-md p-4 sm:p-5">
                  <p class="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{{ m.content }}</p>
                </div>
                <div class="text-right mt-2 px-2">
                  <span class="text-xs text-base-content/50">{{ formatTime(new Date()) }}</span>
                </div>
              </div>
              <div class="avatar placeholder flex-shrink-0">
                <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80">
                  <span class="text-lg sm:text-xl">👤</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="sending" class="flex gap-3 sm:gap-4">
            <div class="avatar placeholder flex-shrink-0">
              <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-secondary to-accent">
                <span class="text-lg sm:text-xl">🤖</span>
              </div>
            </div>
            <div class="flex-1">
              <div class="bg-base-100 border border-base-300 rounded-2xl rounded-tl-md shadow-sm p-5 sm:p-6">
                <div class="flex items-center gap-2">
                  <span class="loading loading-dots loading-sm text-primary"></span>
                  <span class="text-sm text-base-content/60">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t border-base-300 bg-base-100/95 backdrop-blur-lg sticky bottom-0">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <form @submit.prevent="onSend" class="relative">
          <div class="flex gap-2 sm:gap-3 items-end">
            <div class="flex-1 relative">
              <textarea
                v-model="draft"
                rows="1"
                placeholder="Ask me to create a diagram..."
                @input="autoResize"
                @keydown.enter.exact.prevent="onSend"
                ref="inputEl"
                class="textarea textarea-bordered w-full resize-none text-sm sm:text-base pr-12 sm:pr-24 py-3 sm:py-4 leading-relaxed focus:outline-none focus:border-primary transition-colors bg-base-100"
                :class="{'max-h-32 sm:max-h-40': true}"
                :disabled="sending"
              />
              <div class="absolute bottom-3 right-3 flex items-center gap-2">
                <span class="text-xs text-base-content/40 hidden sm:inline">{{ draft.length }}/2000</span>
                <button
                  v-if="draft.trim()"
                  type="button"
                  @click="draft = ''"
                  class="btn btn-ghost btn-circle btn-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              :disabled="!draft.trim() || sending"
              class="btn btn-primary btn-circle sm:btn-md btn-sm shadow-lg hover:shadow-xl transition-all"
            >
              <svg v-if="!sending" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span v-else class="loading loading-spinner loading-sm"></span>
            </button>
          </div>
        </form>
        
        <div class="mt-3 flex items-center justify-center gap-4 text-xs text-base-content/50">
          <span class="hidden sm:inline flex items-center gap-1">
            <kbd class="kbd kbd-xs">Enter</kbd> to send
          </span>
          <span class="hidden sm:inline flex items-center gap-1">
            <kbd class="kbd kbd-xs">Shift</kbd> + <kbd class="kbd kbd-xs">Enter</kbd> for new line
          </span>
          <span class="sm:hidden">Tap send to submit</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Suggestion {
  icon: string
  title: string
  description: string
  prompt: string
}

const suggestions: Suggestion[] = [
  {
    icon: '🔄',
    title: 'Sequence Diagram',
    description: 'Create a sequence diagram for user authentication',
    prompt: 'Create a sequence diagram for user authentication flow'
  },
  {
    icon: '📦',
    title: 'Class Diagram',
    description: 'Generate a class diagram for an e-commerce system',
    prompt: 'Generate a class diagram for an e-commerce system'
  },
  {
    icon: '👥',
    title: 'Use Case Diagram',
    description: 'Make a use case diagram for a booking system',
    prompt: 'Make a use case diagram for a hotel booking system'
  },
  {
    icon: '⚡',
    title: 'Activity Diagram',
    description: 'Show an activity diagram for order processing',
    prompt: 'Show me an activity diagram for order processing workflow'
  }
]

const messages = ref<Message[]>([])
const draft = ref('')
const sending = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

function scrollToBottom() {
  if (messagesEl.value) {
    setTimeout(() => {
      messagesEl.value?.scrollTo({
        top: messagesEl.value.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }
}

function autoResize() {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
    const maxHeight = window.innerWidth < 640 ? 128 : 160
    inputEl.value.style.height = `${Math.min(inputEl.value.scrollHeight, maxHeight)}px`
  }
}

function applySuggestion(suggestion: Suggestion) {
  draft.value = suggestion.prompt
  inputEl.value?.focus()
}

function clearChat() {
  messages.value = []
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
    scrollToBottom()
    sending.value = false
  }, 1500)
}

onMounted(() => {
  scrollToBottom()
  autoResize()
  inputEl.value?.focus()
})

watch(messages, () => nextTick(scrollToBottom))
watch(draft, autoResize)
</script>