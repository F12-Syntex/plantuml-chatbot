<template>
  <div class="business-card-wrapper">
    <div class="card bg-base-100 border border-base-300 shadow-lg overflow-hidden">
      <BusinessCardHeader
        :copied="copied"
        :image-copied="imageCopied"
        :show-back="showingBack"
        @theme="themeDrawerOpen = true"
        @copy="copyCode"
        @download="downloadImage"
        @copy-image="copyImage"
        @toggle-code="toggleCode"
        @toggle-side="toggleSide"
      />

      <div class="p-4 bg-base-50 relative">
        <div class="flex justify-center gap-4">
          <div v-show="!showingBack" class="business-card-preview" :style="computedCardStyle">
            <div v-html="frontHtml" class="w-full h-full"></div>
          </div>

          <div v-show="showingBack" class="business-card-preview" :style="computedCardStyle">
            <div v-html="backHtml" class="w-full h-full"></div>
          </div>
        </div>

        <div class="text-center mt-4">
          <span class="text-xs text-base-content/60">
            {{ showingBack ? 'Back' : 'Front' }} of Business Card
          </span>
        </div>
      </div>

      <div v-if="showCode" class="border-t border-base-300">
        <div class="bg-base-300 px-4 py-2">
          <span class="text-xs font-mono text-base-content/70">Business Card Code</span>
        </div>
        <div class="bg-neutral text-neutral-content p-4 overflow-x-auto">
          <div class="mb-4">
            <div class="text-xs font-semibold mb-2">Front:</div>
            <pre class="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">{{ frontCode }}</pre>
          </div>
          <div>
            <div class="text-xs font-semibold mb-2">Back:</div>
            <pre class="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">{{ backCode }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <BusinessCardThemeSettings
      :model-value="themeDrawerOpen"
      @update:model-value="themeDrawerOpen = $event"
      @apply="applyTheme"
    />
  </div>
</template>

<script setup lang="ts">
import html2canvas from 'html2canvas'

interface BusinessCardTheme {
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  accentColor: string
}

interface Props {
  frontCode: string
  backCode: string
}

const props = defineProps<Props>()

const showCode = ref(false)
const copied = ref(false)
const imageCopied = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const themeDrawerOpen = ref(false)
const showingBack = ref(false)
const downloading = ref(false)

const currentTheme = ref<BusinessCardTheme>({
  backgroundColor: '#ffffff',
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  textColor: '#1f2937',
  accentColor: '#f59e0b'
})

const frontHtml = computed(() => {
  return parseCardCode(props.frontCode)
})

const backHtml = computed(() => {
  return parseCardCode(props.backCode)
})

const computedCardStyle = computed(() => {
  return {
    '--card-bg': currentTheme.value.backgroundColor,
    '--card-primary': currentTheme.value.primaryColor,
    '--card-secondary': currentTheme.value.secondaryColor,
    '--card-text': currentTheme.value.textColor,
    '--card-accent': currentTheme.value.accentColor,
  }
})

function parseCardCode(code: string): string {
  const match = code.match(/```html\n([\s\S]*?)\n```/) || code.match(/```\n([\s\S]*?)\n```/)
  if (match && match[1]) {
    return match[1].trim()
  }
  return code
}

function showToastNotification(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

function toggleCode() {
  showCode.value = !showCode.value
}

function toggleSide() {
  showingBack.value = !showingBack.value
}

async function copyCode() {
  try {
    const fullCode = `Front:\n${props.frontCode}\n\nBack:\n${props.backCode}`
    await navigator.clipboard.writeText(fullCode)
    copied.value = true
    showToastNotification('Code copied to clipboard!')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
    showToastNotification('Failed to copy code')
  }
}

function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  const a = c * Math.cos(h * Math.PI / 180)
  const b = c * Math.sin(h * Math.PI / 180)
  
  let X = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  let Y = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  let Z = (l - 0.0894841775 * a - 1.2914855480 * b) ** 3

  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z
  let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z
  let bVal = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g
  bVal = bVal > 0.0031308 ? 1.055 * Math.pow(bVal, 1 / 2.4) - 0.055 : 12.92 * bVal

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(bVal * 255)))
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function parseRgbString(rgb: string): string {
  const rgbaMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    return rgbToHex(r, g, b)
  }

  const oklchMatch = rgb.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\)/)
  if (oklchMatch) {
    let l = parseFloat(oklchMatch[1])
    if (oklchMatch[1].includes('%')) {
      l = l / 100
    }
    const c = parseFloat(oklchMatch[2])
    const h = parseFloat(oklchMatch[3])
    
    const { r, g, b } = oklchToRgb(l, c, h)
    return rgbToHex(r, g, b)
  }

  return rgb
}

function convertAllColorsToHex(element: HTMLElement) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT)
  const elements: HTMLElement[] = [element]

  let node
  while (node = walker.nextNode()) {
    elements.push(node as HTMLElement)
  }

  elements.forEach(el => {
    const computed = window.getComputedStyle(el)
    const colorProps = [
      'background-color',
      'color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'fill',
      'stroke'
    ]

    colorProps.forEach(prop => {
      const value = computed.getPropertyValue(prop)
      if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)' && value !== 'none') {
        const hexColor = parseRgbString(value)
        if (hexColor.startsWith('#')) {
          el.style.setProperty(prop, hexColor, 'important')
        }
      }
    })

    const bgValue = computed.getPropertyValue('background')
    if (bgValue && bgValue !== 'none') {
      const colorMatch = bgValue.match(/(?:rgba?\([\d\s,]+\)|oklch\([^)]+\))/)
      if (colorMatch) {
        const hexBg = parseRgbString(colorMatch[0])
        if (hexBg.startsWith('#')) {
          el.style.setProperty('background', hexBg, 'important')
        }
      }
    }
  })
}

async function downloadImage() {
  if (downloading.value) return
  downloading.value = true

  try {
    const cards = document.querySelectorAll('.business-card-preview') as NodeListOf<HTMLElement>
    if (!cards || cards.length === 0) return

    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.gap = '40px'
    container.style.padding = '40px'
    container.style.backgroundColor = '#f5f5f5'
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    const frontCard = cards[0].cloneNode(true) as HTMLElement
    const backCard = cards[1].cloneNode(true) as HTMLElement

    const styleVars = computedCardStyle.value
    Object.entries(styleVars).forEach(([key, value]) => {
      frontCard.style.setProperty(key, value)
      backCard.style.setProperty(key, value)
    })

    container.appendChild(frontCard)
    container.appendChild(backCard)

    await nextTick()

    convertAllColorsToHex(container)

    void container.offsetHeight

    await new Promise(resolve => setTimeout(resolve, 100))

    const scale = 3
    const canvas = await html2canvas(container, {
      scale: scale,
      backgroundColor: '#f5f5f5',
      logging: false,
      width: container.offsetWidth,
      height: container.offsetHeight,
      windowWidth: container.offsetWidth,
      windowHeight: container.offsetHeight
    })

    document.body.removeChild(container)

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'business-card-front-and-back.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showToastNotification('Cards downloaded successfully!')
      }
    }, 'image/png')
  } catch (e) {
    console.error('Failed to download:', e)
    showToastNotification('Failed to download image')
  } finally {
    downloading.value = false
  }
}

async function copyImage() {
  if (downloading.value) return
  downloading.value = true

  try {
    const card = document.querySelector('.business-card-preview') as HTMLElement
    if (!card) return

    const clonedCard = card.cloneNode(true) as HTMLElement

    const styleVars = computedCardStyle.value
    Object.entries(styleVars).forEach(([key, value]) => {
      clonedCard.style.setProperty(key, value)
    })

    clonedCard.style.position = 'absolute'
    clonedCard.style.left = '-9999px'
    document.body.appendChild(clonedCard)

    await nextTick()

    convertAllColorsToHex(clonedCard)

    void clonedCard.offsetHeight

    await new Promise(resolve => setTimeout(resolve, 100))

    const scale = 3
    const canvas = await html2canvas(clonedCard, {
      scale: scale,
      backgroundColor: null,
      logging: false
    })

    document.body.removeChild(clonedCard)

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          imageCopied.value = true
          showToastNotification('Image copied to clipboard!')
          setTimeout(() => {
            imageCopied.value = false
          }, 2000)
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError)
          showToastNotification('Failed to copy to clipboard')
        }
      }
    }, 'image/png')
  } catch (e) {
    console.error('Failed to copy image:', e)
    showToastNotification('Failed to copy image to clipboard')
  } finally {
    downloading.value = false
  }
}

function applyTheme(theme: Partial<BusinessCardTheme>) {
  currentTheme.value = {
    backgroundColor: theme.backgroundColor ?? currentTheme.value.backgroundColor,
    primaryColor: theme.primaryColor ?? currentTheme.value.primaryColor,
    secondaryColor: theme.secondaryColor ?? currentTheme.value.secondaryColor,
    textColor: theme.textColor ?? currentTheme.value.textColor,
    accentColor: theme.accentColor ?? currentTheme.value.accentColor,
  }
}
</script>

<style scoped>
.business-card-preview {
  width: 525px;
  height: 300px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background: var(--card-bg);
}

@media (max-width: 640px) {
  .business-card-preview {
    width: 350px;
    height: 200px;
  }
}
</style>