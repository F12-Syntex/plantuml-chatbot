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

  const chat = await getChat(id)

  if (!chat) {
    throw createError({
      statusCode: 404,
      message: 'Chat not found'
    })
  }

  // Log access with enhanced details
  const userAgent = event.node.req.headers['user-agent']
  const deviceInfo = parseUserAgent(userAgent)
  const regionInfo = getClientRegion(event)
  const requestInfo = getRequestInfo(event)
  
  // Generate or get session ID from cookie
  const sessionId = event.node.req.headers.cookie
    ?.split(';')
    .find(c => c.trim().startsWith('session='))
    ?.split('=')[1] || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
  
  await logChatAccess(id, 'viewed', {
    ip: getClientIP(event),
    region: regionInfo.region,
    country: regionInfo.country,
    city: regionInfo.city,
    userAgent,
    ...deviceInfo,
    ...requestInfo,
    sessionId
  })

  // Re-save the chat to ensure it persists (refresh the storage entry)
  // This helps prevent chats from being lost
  await saveChat(chat)

  return chat
})
