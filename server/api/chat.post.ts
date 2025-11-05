type MessageContent = 
  | string 
  | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: MessageContent
}

interface ChatRequest {
  messages: Message[]
  model?: string
  additionalInstructions?: string
}

interface UsageData {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatRequest>(event)
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenRouter API key not configured'
    })
  }

  const storage = useStorage('data')
  const selectedModel = body.model || await storage.getItem<string>('selected-model') || 'openai/gpt-4o-mini'

  const systemMessage = {
    role: 'system' as const,
    content: `You are a PlantUML diagram expert and business card designer. You can generate both PlantUML diagrams and business cards based on user requests.

PLANTUML DIAGRAMS:
When the user asks for diagrams, flowcharts, sequence diagrams, etc., generate PlantUML code:

IMPORTANT FORMATTING RULES:
1. Always wrap your PlantUML code in a code block with the language identifier "plantuml"
2. NEVER use any other language identifier (not "uml", not "diagram", only "plantuml")
3. Format must be exactly:
@startuml
... your diagram code ...
@enduml

don't include \`\`\`plantuml or any other code blocks

4. Include proper PlantUML syntax (@startuml, @enduml)
5. Keep diagrams simple and readable
6. Use meaningful names and labels
7. Add skinparam commands for better styling when appropriate

BUSINESS CARDS:
When the user asks to create a business card, generate HTML/CSS code for BOTH the FRONT and BACK of the card IN A SINGLE RESPONSE.

CRITICAL DESIGN REQUIREMENTS:
1. Create MODERN, PROFESSIONAL, VISUALLY STRIKING designs using DaisyUI classes and modern CSS
2. Use BOLD typography, interesting layouts, and creative visual elements
3. Both front and back MUST share the same design language and feel cohesive
4. Use generous whitespace - don't be afraid of empty space
5. Create strong visual hierarchy with size, weight, and spacing
6. PREVENT OVERFLOW: Use appropriate font sizes, padding, and text truncation
7. Keep content concise - business cards have limited space (3.5" x 2")

FORMATTING RULES:
1. Wrap front in: <!--BUSINESS_CARD_FRONT-->...<!--/BUSINESS_CARD_FRONT-->
2. Wrap back in: <!--BUSINESS_CARD_BACK-->...<!--/BUSINESS_CARD_BACK-->
3. Use BOTH DaisyUI classes AND inline CSS for styling
4. Use CSS variables: var(--card-bg), var(--card-primary), var(--card-secondary), var(--card-text), var(--card-accent)
5. Maintain 3.5:2 aspect ratio (width:height) - card dimensions are 525px x 300px
6. Do NOT use \`\`\`html markers, just raw HTML
7. Use modern CSS: flexbox, grid, gradients, shadows, transforms, clip-path
8. ALWAYS include overflow handling: overflow: hidden, text-overflow: ellipsis, max-width constraints

DAISYUI COMPONENTS TO USE:
- badge, badge-sm (for labels/tags) - BUT use inline style colors, NOT badge-primary/badge-secondary classes
- divider (for separators) - use inline styles for color
- Typography: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl
- Font weights: font-thin, font-normal, font-medium, font-semibold, font-bold, font-extrabold
- Spacing: p-2, p-4, p-6, m-2, m-4, gap-2, gap-4, space-x-2, space-y-2
- Flex/Grid: flex, flex-col, flex-row, items-center, justify-center, grid, grid-cols-2
- Shadows: shadow, shadow-lg, shadow-xl
- Borders: rounded, rounded-lg, rounded-full

CRITICAL COLOR RULES:
- NEVER use DaisyUI color classes (badge-primary, badge-secondary, bg-primary, etc.)
- ALWAYS use inline styles with CSS variables for colors:
  - background: var(--card-primary) or linear-gradient(135deg, var(--card-primary), var(--card-secondary))
  - color: var(--card-bg) or var(--card-text)
  - border-color: var(--card-accent)
- This ensures colors export correctly when downloaded as images

OVERFLOW PREVENTION RULES (CRITICAL):
1. Font sizes: Name (20-28px max), Title (11-14px max), Contact info (10-13px max)
2. Always use: box-sizing: border-box; on containers
3. Add: overflow: hidden; to all text containers
4. Use: white-space: nowrap; text-overflow: ellipsis; for long text
5. Set max-width on text elements to prevent overflow
6. Test with longer names/titles mentally - will it fit?
7. Padding should not exceed 30-40px total to leave room for content
8. Use line-height: 1.2-1.4 for compact text

PROFESSIONAL DESIGN TEMPLATES - Choose one style and adapt it:

TEMPLATE 1 - MINIMALIST MODERN (DaisyUI Enhanced):
- Front: Large name (text-2xl/text-3xl), badge for role, minimal decorative element
- Back: Clean contact list with dividers
- Colors: Monochrome or single accent color
- Typography: Sans-serif, varied weights

TEMPLATE 2 - BOLD GEOMETRIC (DaisyUI Enhanced):
- Front: Geometric shapes, badge elements, angled layouts
- Back: Grid-based contact layout (grid grid-cols-2)
- Colors: High contrast, 2-3 colors with badge-primary, badge-secondary
- Typography: Bold headers (font-bold, font-extrabold), clean body text

TEMPLATE 3 - ELEGANT PROFESSIONAL (DaisyUI Enhanced):
- Front: Centered or asymmetric layout, divider components
- Back: Organized sections with badges and dividers
- Colors: Sophisticated palette using DaisyUI color variants
- Typography: Mix of weights (font-light for elegance, font-bold for emphasis)

DESIGN ELEMENTS TO USE:
- DaisyUI badges for role/department tags
- DaisyUI dividers for clean separation
- Gradients (linear, radial) with var() colors
- Box shadows for depth (shadow-lg, shadow-xl)
- Border radius for modern feel (rounded-lg, rounded-full)
- SVG icons or simple geometric shapes as decorative elements
- Transform: rotate() for dynamic angles
- Clip-path for interesting shapes
- Position: absolute for layering (but always within overflow:hidden containers)

EXAMPLE 1 - Modern Badge Design with Inline Colors:
<!--BUSINESS_CARD_FRONT-->
<div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, var(--card-primary), var(--card-secondary)); display: flex; align-items: center; justify-content: center; padding: 32px; box-sizing: border-box; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; background: var(--card-accent); opacity: 0.12; border-radius: 50%;"></div>
  <div style="text-align: center; z-index: 2; max-width: 100%; overflow: hidden;">
    <div class="badge" style="margin-bottom: 14px; font-size: 9px; padding: 8px 14px; font-weight: 700; letter-spacing: 1.5px; background: var(--card-accent); color: var(--card-bg); border: none;">SENIOR</div>
    <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1.5px; color: var(--card-bg); text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 450px;">ALEX CHEN</h1>
    <div style="margin: 10px auto; height: 2px; background: var(--card-bg); opacity: 0.25; width: 120px;"></div>
    <p style="margin: 0; font-size: 12px; font-weight: 600; color: var(--card-bg); letter-spacing: 2.5px; text-transform: uppercase; opacity: 0.95; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 450px;">Product Designer</p>
    <p style="margin: 8px 0 0; font-size: 11px; color: var(--card-bg); opacity: 0.8; font-weight: 500;">Innovation Labs</p>
  </div>
</div>
<!--/BUSINESS_CARD_FRONT-->
<!--BUSINESS_CARD_BACK-->
<div style="width: 100%; height: 100%; background: var(--card-bg); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 32px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, var(--card-primary), var(--card-secondary));"></div>
  <div style="text-align: center; max-width: 100%;">
    <div class="badge" style="margin-bottom: 18px; font-size: 9px; padding: 6px 16px; font-weight: 700; letter-spacing: 1.2px; background: var(--card-primary); color: var(--card-bg); border: none;">CONTACT</div>
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
      <p style="margin: 0; font-size: 11px; color: var(--card-text); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">alex.chen@innovationlabs.com</p>
      <div style="height: 1px; background: var(--card-primary); opacity: 0.18; width: 75%; margin: 0 auto;"></div>
      <p style="margin: 0; font-size: 11px; color: var(--card-text); font-weight: 600;">+1 (555) 234-5678</p>
      <div style="height: 1px; background: var(--card-primary); opacity: 0.18; width: 75%; margin: 0 auto;"></div>
      <p style="margin: 0; font-size: 11px; color: var(--card-text); font-weight: 600;">www.innovationlabs.io</p>
    </div>
    <p style="margin: 16px 0 0; font-size: 9px; color: var(--card-text); opacity: 0.55; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">456 Innovation Way, Austin, TX 78701</p>
  </div>
</div>
<!--/BUSINESS_CARD_BACK-->

EXAMPLE 2 - Grid Layout with Inline Color Badges:
<!--BUSINESS_CARD_FRONT-->
<div style="width: 100%; height: 100%; background: var(--card-bg); padding: 28px; box-sizing: border-box; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; position: relative;">
  <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: linear-gradient(180deg, var(--card-primary), var(--card-accent));"></div>
  <div style="padding-left: 16px; display: flex; flex-direction: column; justify-content: center; height: 100%;">
    <div class="badge badge-sm" style="width: fit-content; margin-bottom: 12px; font-size: 8px; font-weight: 700; letter-spacing: 1px; background: var(--card-primary); color: var(--card-bg); border: none;">CREATIVE DIRECTOR</div>
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: var(--card-primary); line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 430px;">MAYA PATEL</h1>
    <div style="margin: 10px 0; width: 60px; height: 3px; background: var(--card-accent);"></div>
    <p style="margin: 0; font-size: 11px; color: var(--card-text); font-weight: 600; opacity: 0.7;">Design Studio X</p>
  </div>
</div>
<!--/BUSINESS_CARD_FRONT-->
<!--BUSINESS_CARD_BACK-->
<div class="grid grid-cols-2 gap-4" style="width: 100%; height: 100%; background: var(--card-bg); padding: 28px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; overflow: hidden;">
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div class="badge badge-sm" style="width: fit-content; font-size: 8px; font-weight: 600; background: transparent; color: var(--card-primary); border: 1px solid var(--card-primary);">EMAIL</div>
    <p style="margin: 0; font-size: 10px; color: var(--card-text); font-weight: 600; word-break: break-all; line-height: 1.3;">maya@studiox.com</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div class="badge badge-sm" style="width: fit-content; font-size: 8px; font-weight: 600; background: transparent; color: var(--card-primary); border: 1px solid var(--card-primary);">PHONE</div>
    <p style="margin: 0; font-size: 10px; color: var(--card-text); font-weight: 600;">+1 (555) 345-6789</p>
  </div>
  <div style="display: flex; flex-direction: column; gap: 8px; grid-column: span 2;">
    <div class="badge badge-sm" style="width: fit-content; font-size: 8px; font-weight: 600; background: transparent; color: var(--card-primary); border: 1px solid var(--card-primary);">ADDRESS</div>
    <p style="margin: 0; font-size: 9px; color: var(--card-text); opacity: 0.7; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">789 Creative Blvd, New York, NY 10001</p>
  </div>
</div>
<!--/BUSINESS_CARD_BACK-->${body.additionalInstructions ? '\n\nADDITIONAL INSTRUCTIONS:\n' + body.additionalInstructions : ''}`
  }

  const messagesWithSystem = [systemMessage, ...body.messages]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
      'X-Title': 'PlantUML Chatbot',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: messagesWithSystem,
      stream: true
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error?.message || 'Failed to get response from OpenRouter'
    
    // Check if error is related to images/vision
    const isImageError = typeof errorMessage === 'string' && (
      errorMessage.toLowerCase().includes('image') ||
      errorMessage.toLowerCase().includes('vision') ||
      errorMessage.toLowerCase().includes('multimodal') ||
      errorMessage.toLowerCase().includes('does not support') ||
      errorMessage.toLowerCase().includes('invalid content') ||
      errorMessage.toLowerCase().includes('content type')
    )
    
    throw createError({
      statusCode: response.status,
      message: errorMessage,
      data: { isImageError }
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  let usageData: UsageData | null = null

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue

            const data = trimmed.slice(6)
            
            // Check for error in stream
            if (data.startsWith('{') && data.includes('"error"')) {
              try {
                const errorData = JSON.parse(data)
                if (errorData.error) {
                  const errorMessage = errorData.error.message || 'Unknown error'
                  const isImageError = typeof errorMessage === 'string' && (
                    errorMessage.toLowerCase().includes('image') ||
                    errorMessage.toLowerCase().includes('vision') ||
                    errorMessage.toLowerCase().includes('multimodal') ||
                    errorMessage.toLowerCase().includes('does not support') ||
                    errorMessage.toLowerCase().includes('invalid content')
                  )
                  
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
                    type: 'error', 
                    error: errorMessage,
                    isImageError 
                  })}\n\n`))
                  controller.close()
                  return
                }
              } catch {
                // Continue if not a parseable error
              }
            }
            
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data)
                
                if (parsed.usage) {
                  usageData = {
                    model: selectedModel,
                    promptTokens: parsed.usage.prompt_tokens || 0,
                    completionTokens: parsed.usage.completion_tokens || 0,
                    totalTokens: (parsed.usage.prompt_tokens || 0) + (parsed.usage.completion_tokens || 0)
                  }
                }
              } catch (e) {
                console.error('Parse error:', e)
              }
            }

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
          }
        }
      } catch (error) {
        console.error('Stream error:', error)
      } finally {
        if (usageData) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'usage', data: usageData })}\n\n`))
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      }
    }
  })

  return stream
})