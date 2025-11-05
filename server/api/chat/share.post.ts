import { createChat, logChatAccess } from '../../utils/chatStorage'
import { getClientIP, getClientRegion, parseUserAgent, getRequestInfo } from '../../utils/deviceInfo'

type MessageContent = 
  | string 
  | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: MessageContent
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages: Message[] }>(event)
  
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Messages array is required and must not be empty'
    })
  }

  const chat = await createChat(body.messages)

  // Log creation with enhanced details
  const userAgent = event.node.req.headers['user-agent']
  const deviceInfo = parseUserAgent(userAgent)
  const regionInfo = getClientRegion(event)
  const requestInfo = getRequestInfo(event)
  
  const sessionId = event.node.req.headers.cookie
    ?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1] || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  await logChatAccess(chat.id, 'created', {
    ip: getClientIP(event),
    region: regionInfo.region,
    country: regionInfo.country,
    city: regionInfo.city,
    userAgent,
    ...deviceInfo,
    ...requestInfo,
    sessionId
  })

  return { id: chat.id }
})

