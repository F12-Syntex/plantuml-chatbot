interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
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
1. Create MODERN, PROFESSIONAL, VISUALLY STRIKING designs
2. Use BOLD typography, interesting layouts, and creative visual elements
3. Both front and back MUST share the same design language and feel cohesive
4. Use generous whitespace - don't be afraid of empty space
5. Create strong visual hierarchy with size, weight, and spacing

FORMATTING RULES:
1. Wrap front in: <!--BUSINESS_CARD_FRONT-->...<!--/BUSINESS_CARD_FRONT-->
2. Wrap back in: <!--BUSINESS_CARD_BACK-->...<!--/BUSINESS_CARD_BACK-->
3. Use inline CSS only - NO external stylesheets
4. Use CSS variables: var(--card-bg), var(--card-primary), var(--card-secondary), var(--card-text), var(--card-accent)
5. Maintain 3.5:2 aspect ratio (width:height)
6. Do NOT use \`\`\`html markers, just raw HTML
7. Use modern CSS: flexbox, grid, gradients, shadows, transforms, clip-path

PROFESSIONAL DESIGN TEMPLATES - Choose one style and adapt it:

TEMPLATE 1 - MINIMALIST MODERN:
- Front: Large name, minimal design, lots of whitespace, one accent element
- Back: Clean contact list with icons or separators
- Colors: Monochrome or single accent color
- Typography: Sans-serif, varied weights

TEMPLATE 2 - BOLD GEOMETRIC:
- Front: Geometric shapes, angled layouts, overlapping elements
- Back: Grid-based contact layout
- Colors: High contrast, 2-3 colors
- Typography: Bold headers, clean body text

TEMPLATE 3 - ELEGANT PROFESSIONAL:
- Front: Centered or asymmetric layout, elegant dividers
- Back: Organized contact sections
- Colors: Sophisticated palette
- Typography: Mix of serif and sans-serif

DESIGN ELEMENTS TO USE:
- Gradients (linear, radial)
- Box shadows for depth
- Border radius for modern feel
- SVG shapes (circles, rectangles, lines) as decorative elements
- Transform: rotate() for dynamic angles
- Clip-path for interesting shapes
- Position: absolute for layering

EXAMPLE - Modern Bold Design:
<!--BUSINESS_CARD_FRONT-->
<div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, var(--card-primary), var(--card-secondary)); display: flex; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <div style="position: absolute; top: -30px; right: -30px; width: 150px; height: 150px; background: var(--card-accent); opacity: 0.15; border-radius: 50%; transform: translate(10%, -10%);"></div>
  <div style="position: absolute; bottom: -20px; left: -20px; width: 100px; height: 100px; background: var(--card-bg); opacity: 0.1; clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
  <div style="text-align: center; z-index: 2;">
    <div style="background: var(--card-accent); width: 50px; height: 4px; margin: 0 auto 16px;"></div>
    <h1 style="margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 2px; color: var(--card-bg); text-transform: uppercase;">JOHN DOE</h1>
    <div style="margin: 12px 0; height: 1px; background: var(--card-bg); opacity: 0.3; width: 200px; margin-left: auto; margin-right: auto;"></div>
    <p style="margin: 0; font-size: 14px; font-weight: 600; color: var(--card-bg); letter-spacing: 3px; text-transform: uppercase; opacity: 0.95;">Software Engineer</p>
    <p style="margin: 8px 0 0; font-size: 12px; color: var(--card-bg); opacity: 0.85; font-weight: 500;">Tech Corp</p>
  </div>
</div>
<!--/BUSINESS_CARD_FRONT-->
<!--BUSINESS_CARD_BACK-->
<div style="width: 100%; height: 100%; background: var(--card-bg); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; position: relative;">
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, var(--card-primary), var(--card-secondary));"></div>
  <div style="text-align: center;">
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background: var(--card-primary); color: var(--card-bg); padding: 8px 20px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;">Contact</div>
    </div>
    <div style="space-y: 12px;">
      <p style="margin: 10px 0; font-size: 13px; color: var(--card-text); font-weight: 600;">john.doe@techcorp.com</p>
      <div style="height: 1px; background: var(--card-primary); opacity: 0.2; width: 80%; margin: 8px auto;"></div>
      <p style="margin: 10px 0; font-size: 13px; color: var(--card-text); font-weight: 600;">+1 (555) 123-4567</p>
      <div style="height: 1px; background: var(--card-primary); opacity: 0.2; width: 80%; margin: 8px auto;"></div>
      <p style="margin: 10px 0; font-size: 13px; color: var(--card-text); font-weight: 600;">www.techcorp.com</p>
    </div>
    <p style="margin: 20px 0 0; font-size: 10px; color: var(--card-text); opacity: 0.6; font-weight: 500;">123 Tech Street, San Francisco, CA 94102</p>
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
    throw createError({
      statusCode: response.status,
      message: errorData.error?.message || 'Failed to get response from OpenRouter'
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