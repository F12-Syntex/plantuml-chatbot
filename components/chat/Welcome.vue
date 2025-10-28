<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
    <div class="text-center space-y-4 mb-8">
      <div class="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mb-4">
        <MdiChartBoxOutline class="text-5xl sm:text-6xl text-primary" />
      </div>
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-primary pb-2 bg-clip-text text-transparent">
        Let's Create Diagrams
      </h2>
      <p class="text-sm sm:text-base lg:text-lg text-base-content/70 max-w-lg mx-auto px-4 py-4">
        Transform your ideas into beautiful PlantUML diagrams. Just describe what you need!
      </p>
    </div>
    
    <div class="hidden md:grid grid-cols-2 gap-3 lg:gap-4 w-full max-w-3xl">
      <button 
        v-for="(suggestion, idx) in suggestions" 
        :key="idx"
        @click="$emit('applySuggestion', suggestion)"
        class="group card bg-base-100 hover:bg-base-200 border border-base-300 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
      >
        <div class="card-body p-4 lg:p-5">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <component :is="suggestion.icon" class="text-xl text-primary" />
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

    <div class="md:hidden w-full max-w-md space-y-2">
      <button 
        v-for="(suggestion, idx) in suggestions" 
        :key="idx"
        @click="$emit('applySuggestion', suggestion)"
        class="btn btn-outline w-full justify-start gap-3 h-auto py-3 px-4 normal-case"
      >
        <component :is="suggestion.icon" class="text-2xl" />
        <div class="text-left flex-1">
          <div class="font-semibold text-sm">{{ suggestion.title }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiSwapHorizontal from '~icons/mdi/swap-horizontal'
import MdiPackageVariant from '~icons/mdi/package-variant'
import MdiAccountGroup from '~icons/mdi/account-group'
import MdiLightningBolt from '~icons/mdi/lightning-bolt'
import MdiChartBoxOutline from '~icons/mdi/chart-box-outline'

interface Suggestion {
  icon: Component
  title: string
  description: string
  prompt: string
}

const suggestions: Suggestion[] = [
  {
    icon: MdiSwapHorizontal,
    title: 'Sequence Diagram',
    description: 'Create a sequence diagram for user authentication',
    prompt: 'Create a sequence diagram for user authentication flow'
  },
  {
    icon: MdiPackageVariant,
    title: 'Class Diagram',
    description: 'Generate a class diagram for an e-commerce system',
    prompt: 'Generate a class diagram for an e-commerce system'
  },
  {
    icon: MdiAccountGroup,
    title: 'Use Case Diagram',
    description: 'Make a use case diagram for a booking system',
    prompt: 'Make a use case diagram for a hotel booking system'
  },
  {
    icon: MdiLightningBolt,
    title: 'Activity Diagram',
    description: 'Show an activity diagram for order processing',
    prompt: 'Show me an activity diagram for order processing workflow'
  }
]

defineEmits<{
  applySuggestion: [suggestion: Suggestion]
}>()
</script>