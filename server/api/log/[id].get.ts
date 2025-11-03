import { getChatAccessLogs } from '../../utils/chatStorage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Chat ID is required'
    })
  }

  const logs = await getChatAccessLogs(id)
  return logs
})

