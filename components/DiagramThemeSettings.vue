<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Diagram Theme">
    <div class="space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          v-for="preset in themePresets"
          :key="preset.name"
          @click="applyPreset(preset)"
          class="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 bg-base-200"
          :class="isCurrentPreset(preset) ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100' : 'border-base-300 hover:border-base-content/20'"
        >
          <div class="p-4 h-full flex flex-col gap-2">
            <div class="flex gap-1.5 mb-2">
              <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: preset.primaryColor }"></div>
              <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: preset.secondaryColor }"></div>
              <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: preset.arrowColor }"></div>
              <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: preset.accentColor }"></div>
            </div>
            <div class="pt-2 border-t border-base-content/10 flex items-center justify-between gap-2">
              <p class="text-xs font-semibold capitalize text-base-content">{{ preset.name }}</p>
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: preset.highlightColor }"></div>
            </div>
          </div>
        </button>
      </div>
      <div class="flex gap-2">
        <button @click="resetTheme" class="btn btn-ghost btn-sm">Reset</button>
      </div>
    </div>
  </ThemeDrawer>
</template>

<script setup lang="ts">
interface DiagramTheme {
  name?: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  borderColor: string
  arrowColor: string
  accentColor: string
  highlightColor: string
}

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply': [theme: DiagramTheme]
}>()

const themePresets: DiagramTheme[] = [
  {
    name: 'Default',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    textColor: '#1F2937',
    borderColor: '#6B7280',
    arrowColor: '#1F2937',
    accentColor: '#10B981',
    highlightColor: '#FBBF24'
  },
  {
    name: 'Dark',
    primaryColor: '#60A5FA',
    secondaryColor: '#A78BFA',
    textColor: '#F9FAFB',
    borderColor: '#9CA3AF',
    arrowColor: '#F9FAFB',
    accentColor: '#34D399',
    highlightColor: '#FCD34D'
  },
  {
    name: 'Ocean',
    primaryColor: '#0EA5E9',
    secondaryColor: '#06B6D4',
    textColor: '#0C4A6E',
    borderColor: '#0891B2',
    arrowColor: '#0C4A6E',
    accentColor: '#0284C7',
    highlightColor: '#22D3EE'
  },
  {
    name: 'Forest',
    primaryColor: '#10B981',
    secondaryColor: '#34D399',
    textColor: '#064E3B',
    borderColor: '#059669',
    arrowColor: '#064E3B',
    accentColor: '#14B8A6',
    highlightColor: '#84CC16'
  },
  {
    name: 'Sunset',
    primaryColor: '#F97316',
    secondaryColor: '#FB923C',
    textColor: '#7C2D12',
    borderColor: '#EA580C',
    arrowColor: '#7C2D12',
    accentColor: '#EF4444',
    highlightColor: '#FBBF24'
  },
  {
    name: 'Purple',
    primaryColor: '#A855F7',
    secondaryColor: '#C084FC',
    textColor: '#581C87',
    borderColor: '#9333EA',
    arrowColor: '#581C87',
    accentColor: '#D946EF',
    highlightColor: '#E879F9'
  },
  {
    name: 'Rose',
    primaryColor: '#F43F5E',
    secondaryColor: '#FB7185',
    textColor: '#881337',
    borderColor: '#E11D48',
    arrowColor: '#881337',
    accentColor: '#EC4899',
    highlightColor: '#F472B6'
  },
  {
    name: 'Amber',
    primaryColor: '#F59E0B',
    secondaryColor: '#FBBF24',
    textColor: '#78350F',
    borderColor: '#D97706',
    arrowColor: '#78350F',
    accentColor: '#F97316',
    highlightColor: '#FCD34D'
  },
  {
    name: 'Emerald',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    textColor: '#064E3B',
    borderColor: '#047857',
    arrowColor: '#064E3B',
    accentColor: '#14B8A6',
    highlightColor: '#2DD4BF'
  },
  {
    name: 'Indigo',
    primaryColor: '#6366F1',
    secondaryColor: '#818CF8',
    textColor: '#312E81',
    borderColor: '#4F46E5',
    arrowColor: '#312E81',
    accentColor: '#8B5CF6',
    highlightColor: '#A78BFA'
  },
  {
    name: 'Teal',
    primaryColor: '#14B8A6',
    secondaryColor: '#2DD4BF',
    textColor: '#134E4A',
    borderColor: '#0F766E',
    arrowColor: '#134E4A',
    accentColor: '#06B6D4',
    highlightColor: '#22D3EE'
  },
  {
    name: 'Slate',
    primaryColor: '#64748B',
    secondaryColor: '#94A3B8',
    textColor: '#1E293B',
    borderColor: '#475569',
    arrowColor: '#1E293B',
    accentColor: '#334155',
    highlightColor: '#CBD5E1'
  },
  {
    name: 'Crimson',
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
    textColor: '#7F1D1D',
    borderColor: '#B91C1C',
    arrowColor: '#7F1D1D',
    accentColor: '#F43F5E',
    highlightColor: '#FB7185'
  },
  {
    name: 'Lime',
    primaryColor: '#84CC16',
    secondaryColor: '#A3E635',
    textColor: '#365314',
    borderColor: '#65A30D',
    arrowColor: '#365314',
    accentColor: '#10B981',
    highlightColor: '#BEF264'
  },
  {
    name: 'Sky',
    primaryColor: '#0284C7',
    secondaryColor: '#0EA5E9',
    textColor: '#0C4A6E',
    borderColor: '#0369A1',
    arrowColor: '#0C4A6E',
    accentColor: '#06B6D4',
    highlightColor: '#38BDF8'
  },
  {
    name: 'Violet',
    primaryColor: '#7C3AED',
    secondaryColor: '#8B5CF6',
    textColor: '#4C1D95',
    borderColor: '#6D28D9',
    arrowColor: '#4C1D95',
    accentColor: '#A855F7',
    highlightColor: '#C084FC'
  },
  {
    name: 'Fuchsia',
    primaryColor: '#C026D3',
    secondaryColor: '#D946EF',
    textColor: '#701A75',
    borderColor: '#A21CAF',
    arrowColor: '#701A75',
    accentColor: '#E879F9',
    highlightColor: '#F0ABFC'
  },
  {
    name: 'Cyan',
    primaryColor: '#0891B2',
    secondaryColor: '#06B6D4',
    textColor: '#164E63',
    borderColor: '#0E7490',
    arrowColor: '#164E63',
    accentColor: '#22D3EE',
    highlightColor: '#67E8F9'
  },
  {
    name: 'Mint',
    primaryColor: '#10B981',
    secondaryColor: '#6EE7B7',
    textColor: '#065F46',
    borderColor: '#059669',
    arrowColor: '#065F46',
    accentColor: '#34D399',
    highlightColor: '#A7F3D0'
  },
  {
    name: 'Coral',
    primaryColor: '#FF6B6B',
    secondaryColor: '#FF8787',
    textColor: '#862E2E',
    borderColor: '#E85D5D',
    arrowColor: '#862E2E',
    accentColor: '#FFA5A5',
    highlightColor: '#FFC3C3'
  }
]

const currentTheme = ref<DiagramTheme>({ ...themePresets[0] })

function applyPreset(preset: DiagramTheme) {
  currentTheme.value = { ...preset }
  applyTheme()
}

function isCurrentPreset(preset: DiagramTheme): boolean {
  return currentTheme.value.primaryColor === preset.primaryColor &&
         currentTheme.value.secondaryColor === preset.secondaryColor &&
         currentTheme.value.accentColor === preset.accentColor
}

function applyTheme() {
  emit('apply', currentTheme.value)
  emit('update:modelValue', false)
}

function resetTheme() {
  currentTheme.value = { ...themePresets[0] }
  applyTheme()
}
</script>