import { getChatAccessLogs, logChatAccess } from '../../../utils/chatStorage'
import { getClientIP, getClientRegion, parseUserAgent, getRequestInfo } from '../../../utils/deviceInfo'
import { put, head } from '@vercel/blob'

export default defineEventHandler(async (event) => {
  const chatId = getRouterParam(event, 'id')
  const body = await readBody<{ timestamp?: string; all?: boolean }>(event)
  
  if (!chatId) {
    throw createError({
      statusCode: 400,
      message: 'Chat ID is required'
    })
  }

  try {
    const logs = await getChatAccessLogs(chatId)
    
    if (body.all) {
      // Delete all logs
      const logPath = `chats/${chatId}_logs.json`
      
      // Save empty array
      const blob = await put(logPath, JSON.stringify([]), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true
      })
      
      // Log the deletion
      const userAgent = event.node.req.headers['user-agent']
      const deviceInfo = parseUserAgent(userAgent)
      const regionInfo = getClientRegion(event)
      const requestInfo = getRequestInfo(event)
      
      await logChatAccess(chatId, 'deleted', {
        ip: getClientIP(event),
        region: regionInfo.region,
        country: regionInfo.country,
        city: regionInfo.city,
        userAgent,
        ...deviceInfo,
        ...requestInfo
      })
      
      return { success: true, message: 'All logs deleted successfully', deletedCount: logs.length }
    } else if (body.timestamp) {
      // Delete specific log entry
      const filteredLogs = logs.filter(log => log.timestamp !== body.timestamp)
      
      if (filteredLogs.length === logs.length) {
        throw createError({
          statusCode: 404,
          message: 'Log entry not found'
        })
      }
      
      const logPath = `chats/${chatId}_logs.json`
      await put(logPath, JSON.stringify(filteredLogs), {
        access: 'public',
        contentType: 'application/json',
        allowOverwrite: true
      })
      
      return { success: true, message: 'Log entry deleted successfully' }
    } else {
      throw createError({
        statusCode: 400,
        message: 'Either timestamp or all=true is required'
      })
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete log(s)'
    })
  }
})

