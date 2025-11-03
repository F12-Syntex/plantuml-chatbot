import { deleteChat, logChatAccess } from '../../utils/chatStorage'
import { getClientIP, getClientRegion, parseUserAgent, getRequestInfo } from '../../utils/deviceInfo'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Chat ID is required'
    })
  }

  try {
    // Log deletion before deleting
    const userAgent = event.node.req.headers['user-agent']
    const deviceInfo = parseUserAgent(userAgent)
    const regionInfo = getClientRegion(event)
    const requestInfo = getRequestInfo(event)
    
    await logChatAccess(id, 'deleted', {
      ip: getClientIP(event),
      region: regionInfo.region,
      country: regionInfo.country,
      city: regionInfo.city,
      userAgent,
      ...deviceInfo,
      ...requestInfo
    })

    // Delete the chat and its logs
    await deleteChat(id)

    return { success: true, message: 'Chat deleted successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete chat'
    })
  }
})

