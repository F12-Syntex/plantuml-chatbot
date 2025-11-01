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
import html2canvas from 'html2canvas-pro'

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

    // Apply all computed styles as inline styles
    const importantStyles = [
      'background-color',
      'background',
      'color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-width',
      'border-style',
      'border-radius',
      'padding',
      'margin',
      'font-size',
      'font-weight',
      'font-family',
      'line-height',
      'text-align',
      'display',
      'width',
      'height',
      'fill',
      'stroke',
      'flex-direction',
      'align-items',
      'justify-content',
      'gap'
    ]

    importantStyles.forEach(prop => {
      const value = computed.getPropertyValue(prop)
      if (value && value !== '' && value !== 'none') {
        // Convert color values to hex
        if (prop.includes('color') || prop === 'background' || prop === 'fill' || prop === 'stroke') {
          if (value.includes('rgb') || value.includes('oklch')) {
            const hexColor = parseRgbString(value)
            if (hexColor.startsWith('#')) {
              el.style.setProperty(prop, hexColor, 'important')
            } else {
              el.style.setProperty(prop, value, 'important')
            }
          } else if (value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
            el.style.setProperty(prop, value, 'important')
          }
        } else {
          el.style.setProperty(prop, value, 'important')
        }
      }
    })

    // Special handling for DaisyUI badge and other component styles
    if (el.classList.contains('badge')) {
      // Ensure badge styles are fully computed
      const bgColor = computed.backgroundColor
      const textColor = computed.color
      const borderColor = computed.borderColor

      if (bgColor && bgColor !== 'transparent') {
        const hexBg = parseRgbString(bgColor)
        if (hexBg.startsWith('#')) {
          el.style.setProperty('background-color', hexBg, 'important')
        }
      }

      if (textColor) {
        const hexText = parseRgbString(textColor)
        if (hexText.startsWith('#')) {
          el.style.setProperty('color', hexText, 'important')
        }
      }

      if (borderColor && borderColor !== 'transparent') {
        const hexBorder = parseRgbString(borderColor)
        if (hexBorder.startsWith('#')) {
          el.style.setProperty('border-color', hexBorder, 'important')
        }
      }
    }

    // Handle divider pseudo-elements by converting to real elements
    if (el.classList.contains('divider')) {
      // Remove the class that uses pseudo-elements and add inline divider
      if (!el.querySelector('.divider-line')) {
        el.style.display = 'block'
        el.style.height = '1px'
        el.style.width = '100%'

        const bgValue = computed.backgroundColor
        if (bgValue && bgValue !== 'transparent' && bgValue !== 'rgba(0, 0, 0, 0)') {
          const hexColor = parseRgbString(bgValue)
          if (hexColor.startsWith('#')) {
            el.style.backgroundColor = hexColor
          }
        } else {
          // Use a default gray if no background is set
          el.style.backgroundColor = '#e5e7eb'
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
      useCORS: true,
      allowTaint: true,
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
      logging: false,
      useCORS: true,
      allowTaint: true
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
  position: relative;
  contain: layout style paint;
}

.business-card-preview :deep(*) {
  box-sizing: border-box;
}

/* Add overflow protection for common text elements */
.business-card-preview :deep(h1),
.business-card-preview :deep(h2),
.business-card-preview :deep(h3),
.business-card-preview :deep(p),
.business-card-preview :deep(span),
.business-card-preview :deep(div) {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Ensure DaisyUI components work properly */
.business-card-preview :deep(.badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  height: 1.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: fit-content;
  padding-left: 0.563rem;
  padding-right: 0.563rem;
  border-width: 1px;
  border-radius: var(--rounded-badge, 1.9rem);
  border-color: transparent;
  background-color: var(--fallback-b2, oklch(var(--b2)/1));
  color: var(--fallback-bc, oklch(var(--bc)/1));
  flex-shrink: 0;
  white-space: nowrap;
}

.business-card-preview :deep(.badge-primary) {
  background-color: var(--fallback-p, oklch(var(--p)/1));
  border-color: var(--fallback-p, oklch(var(--p)/1));
  color: var(--fallback-pc, oklch(var(--pc)/1));
}

.business-card-preview :deep(.badge-secondary) {
  background-color: var(--fallback-s, oklch(var(--s)/1));
  border-color: var(--fallback-s, oklch(var(--s)/1));
  color: var(--fallback-sc, oklch(var(--sc)/1));
}

.business-card-preview :deep(.badge-accent) {
  background-color: var(--fallback-a, oklch(var(--a)/1));
  border-color: var(--fallback-a, oklch(var(--a)/1));
  color: var(--fallback-ac, oklch(var(--ac)/1));
}

.business-card-preview :deep(.badge-outline) {
  background-color: transparent;
  border-color: currentColor;
}

.business-card-preview :deep(.badge-sm) {
  height: 1rem;
  font-size: 0.75rem;
  line-height: 1rem;
  padding-left: 0.438rem;
  padding-right: 0.438rem;
}

.business-card-preview :deep(.divider) {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: stretch;
  margin-top: 1rem;
  margin-bottom: 1rem;
  height: 1rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.business-card-preview :deep(.divider::before),
.business-card-preview :deep(.divider::after) {
  content: '';
  flex-grow: 1;
  height: 0.125rem;
  width: 100%;
  background-color: var(--fallback-bc, oklch(var(--bc)/0.1));
}

/* Add grid support */
.business-card-preview :deep(.grid) {
  display: grid;
}

.business-card-preview :deep(.grid-cols-1) {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.business-card-preview :deep(.grid-cols-2) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.business-card-preview :deep(.grid-cols-3) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.business-card-preview :deep(.gap-1) {
  gap: 0.25rem;
}

.business-card-preview :deep(.gap-2) {
  gap: 0.5rem;
}

.business-card-preview :deep(.gap-3) {
  gap: 0.75rem;
}

.business-card-preview :deep(.gap-4) {
  gap: 1rem;
}

.business-card-preview :deep(.gap-6) {
  gap: 1.5rem;
}

.business-card-preview :deep(.gap-8) {
  gap: 2rem;
}

/* Ensure flex layouts work */
.business-card-preview :deep(.flex) {
  display: flex;
}

.business-card-preview :deep(.flex-row) {
  flex-direction: row;
}

.business-card-preview :deep(.flex-col) {
  flex-direction: column;
}

.business-card-preview :deep(.items-start) {
  align-items: flex-start;
}

.business-card-preview :deep(.items-center) {
  align-items: center;
}

.business-card-preview :deep(.items-end) {
  align-items: flex-end;
}

.business-card-preview :deep(.justify-start) {
  justify-content: flex-start;
}

.business-card-preview :deep(.justify-center) {
  justify-content: center;
}

.business-card-preview :deep(.justify-between) {
  justify-content: space-between;
}

.business-card-preview :deep(.justify-end) {
  justify-content: flex-end;
}

/* Typography utilities */
.business-card-preview :deep(.text-xs) {
  font-size: 0.75rem;
  line-height: 1rem;
}

.business-card-preview :deep(.text-sm) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.business-card-preview :deep(.text-base) {
  font-size: 1rem;
  line-height: 1.5rem;
}

.business-card-preview :deep(.text-lg) {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.business-card-preview :deep(.text-xl) {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.business-card-preview :deep(.text-2xl) {
  font-size: 1.5rem;
  line-height: 2rem;
}

.business-card-preview :deep(.text-3xl) {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.business-card-preview :deep(.text-4xl) {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

/* Font weights */
.business-card-preview :deep(.font-thin) {
  font-weight: 100;
}

.business-card-preview :deep(.font-light) {
  font-weight: 300;
}

.business-card-preview :deep(.font-normal) {
  font-weight: 400;
}

.business-card-preview :deep(.font-medium) {
  font-weight: 500;
}

.business-card-preview :deep(.font-semibold) {
  font-weight: 600;
}

.business-card-preview :deep(.font-bold) {
  font-weight: 700;
}

.business-card-preview :deep(.font-extrabold) {
  font-weight: 800;
}

.business-card-preview :deep(.font-black) {
  font-weight: 900;
}

/* Spacing utilities */
.business-card-preview :deep(.space-x-1 > * + *) {
  margin-left: 0.25rem;
}

.business-card-preview :deep(.space-x-2 > * + *) {
  margin-left: 0.5rem;
}

.business-card-preview :deep(.space-x-4 > * + *) {
  margin-left: 1rem;
}

.business-card-preview :deep(.space-y-1 > * + *) {
  margin-top: 0.25rem;
}

.business-card-preview :deep(.space-y-2 > * + *) {
  margin-top: 0.5rem;
}

.business-card-preview :deep(.space-y-4 > * + *) {
  margin-top: 1rem;
}

/* Padding utilities */
.business-card-preview :deep(.p-2) {
  padding: 0.5rem;
}

.business-card-preview :deep(.p-4) {
  padding: 1rem;
}

.business-card-preview :deep(.p-6) {
  padding: 1.5rem;
}

.business-card-preview :deep(.p-8) {
  padding: 2rem;
}

/* Margin utilities */
.business-card-preview :deep(.m-2) {
  margin: 0.5rem;
}

.business-card-preview :deep(.m-4) {
  margin: 1rem;
}

/* Rounded utilities */
.business-card-preview :deep(.rounded) {
  border-radius: 0.25rem;
}

.business-card-preview :deep(.rounded-lg) {
  border-radius: 0.5rem;
}

.business-card-preview :deep(.rounded-full) {
  border-radius: 9999px;
}

/* Shadow utilities */
.business-card-preview :deep(.shadow) {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.business-card-preview :deep(.shadow-lg) {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.business-card-preview :deep(.shadow-xl) {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

@media (max-width: 640px) {
  .business-card-preview {
    width: 350px;
    height: 200px;
  }
}
</style>