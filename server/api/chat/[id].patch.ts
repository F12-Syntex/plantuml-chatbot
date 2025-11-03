import { getChat, saveChat, logChatAccess } from '../../utils/chatStorage'
import { getClientIP, getClientRegion, parseUserAgent, getRequestInfo } from '../../utils/deviceInfo'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Chat ID is required'
    })
  }

  const body = await readBody(event)
  const { messageIndex } = body

  if (typeof messageIndex !== 'number' || messageIndex < 0) {
    throw createError({
      statusCode: 400,
      message: 'Valid messageIndex is required'
    })
  }

  const chat = await getChat(id)

  if (!chat) {
    throw createError({
      statusCode: 404,
      message: 'Chat not found'
    })
  }

  // Validate message index
  if (messageIndex >= chat.messages.length) {
    throw createError({
      statusCode: 400,
      message: 'Message index out of bounds'
    })
  }

  // Remove the message at the specified index
  chat.messages.splice(messageIndex, 1)

  // Save the updated chat
  await saveChat(chat)

  // Log access
  const userAgent = event.node.req.headers['user-agent']
  const deviceInfo = parseUserAgent(userAgent)
  const regionInfo = getClientRegion(event)
  const requestInfo = getRequestInfo(event)
  
  const sessionId = event.node.req.headers.cookie
    ?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1] || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  await logChatAccess(id, 'updated', {
    ip: getClientIP(event),
    region: regionInfo.region,
    country: regionInfo.country,
    city: regionInfo.city,
    userAgent,
    ...deviceInfo,
    ...requestInfo,
    sessionId
  })

  return chat
})
