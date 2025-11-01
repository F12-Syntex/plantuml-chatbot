<template>
  <ThemeDrawer :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Business Card Theme">
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
              <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: preset.accentColor }"></div>
            </div>
            <div class="pt-2 border-t border-base-content/10 flex items-center justify-between gap-2">
              <p class="text-xs font-semibold capitalize text-base-content">{{ preset.name }}</p>
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: preset.textColor }"></div>
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
interface BusinessCardTheme {
  name?: string
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  accentColor: string
}

interface Props {
  modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'apply': [theme: BusinessCardTheme]
}>()

const themePresets: BusinessCardTheme[] = [
  {
    name: 'Professional',
    backgroundColor: '#FFFFFF',
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    textColor: '#1F2937',
    accentColor: '#F59E0B'
  },
  {
    name: 'Dark Elite',
    backgroundColor: '#1F2937',
    primaryColor: '#F9FAFB',
    secondaryColor: '#60A5FA',
    textColor: '#F9FAFB',
    accentColor: '#FBBF24'
  },
  {
    name: 'Ocean Blue',
    backgroundColor: '#EFF6FF',
    primaryColor: '#0EA5E9',
    secondaryColor: '#0284C7',
    textColor: '#0C4A6E',
    accentColor: '#22D3EE'
  },
  {
    name: 'Forest Green',
    backgroundColor: '#F0FDF4',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    textColor: '#064E3B',
    accentColor: '#84CC16'
  },
  {
    name: 'Sunset Orange',
    backgroundColor: '#FFF7ED',
    primaryColor: '#EA580C',
    secondaryColor: '#F97316',
    textColor: '#7C2D12',
    accentColor: '#FBBF24'
  },
  {
    name: 'Royal Purple',
    backgroundColor: '#FAF5FF',
    primaryColor: '#7C3AED',
    secondaryColor: '#A855F7',
    textColor: '#4C1D95',
    accentColor: '#E879F9'
  },
  {
    name: 'Rose Gold',
    backgroundColor: '#FFF1F2',
    primaryColor: '#BE123C',
    secondaryColor: '#FB7185',
    textColor: '#881337',
    accentColor: '#FBBF24'
  },
  {
    name: 'Midnight',
    backgroundColor: '#0F172A',
    primaryColor: '#60A5FA',
    secondaryColor: '#3B82F6',
    textColor: '#F1F5F9',
    accentColor: '#FCD34D'
  },
  {
    name: 'Emerald',
    backgroundColor: '#ECFDF5',
    primaryColor: '#047857',
    secondaryColor: '#059669',
    textColor: '#064E3B',
    accentColor: '#2DD4BF'
  },
  {
    name: 'Crimson',
    backgroundColor: '#FEF2F2',
    primaryColor: '#B91C1C',
    secondaryColor: '#DC2626',
    textColor: '#7F1D1D',
    accentColor: '#F59E0B'
  },
  {
    name: 'Slate Gray',
    backgroundColor: '#F8FAFC',
    primaryColor: '#475569',
    secondaryColor: '#64748B',
    textColor: '#1E293B',
    accentColor: '#3B82F6'
  },
  {
    name: 'Teal',
    backgroundColor: '#F0FDFA',
    primaryColor: '#0F766E',
    secondaryColor: '#14B8A6',
    textColor: '#134E4A',
    accentColor: '#22D3EE'
  },
  {
    name: 'Gold Luxury',
    backgroundColor: '#FFFBEB',
    primaryColor: '#92400E',
    secondaryColor: '#D97706',
    textColor: '#78350F',
    accentColor: '#FBBF24'
  },
  {
    name: 'Navy',
    backgroundColor: '#EFF6FF',
    primaryColor: '#1E3A8A',
    secondaryColor: '#2563EB',
    textColor: '#1E3A8A',
    accentColor: '#F59E0B'
  },
  {
    name: 'Mint Fresh',
    backgroundColor: '#F0FDF4',
    primaryColor: '#065F46',
    secondaryColor: '#10B981',
    textColor: '#064E3B',
    accentColor: '#6EE7B7'
  },
  {
    name: 'Coral',
    backgroundColor: '#FFF5F5',
    primaryColor: '#E85D5D',
    secondaryColor: '#FF8787',
    textColor: '#862E2E',
    accentColor: '#FFC3C3'
  },
  {
    name: 'Charcoal',
    backgroundColor: '#374151',
    primaryColor: '#F3F4F6',
    secondaryColor: '#9CA3AF',
    textColor: '#F9FAFB',
    accentColor: '#FBBF24'
  },
  {
    name: 'Sky',
    backgroundColor: '#F0F9FF',
    primaryColor: '#0369A1',
    secondaryColor: '#0EA5E9',
    textColor: '#0C4A6E',
    accentColor: '#38BDF8'
  }
]

const currentTheme = ref<BusinessCardTheme>({ ...themePresets[0] })

function applyPreset(preset: BusinessCardTheme) {
  currentTheme.value = { ...preset }
  applyTheme()
}

function isCurrentPreset(preset: BusinessCardTheme): boolean {
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
