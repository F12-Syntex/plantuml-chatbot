import { getChat } from '../../utils/chatStorage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Chat ID is required'
    })
  }

  const chat = getChat(id)

  if (!chat) {
    throw createError({
      statusCode: 404,
      message: 'Chat not found'
    })
  }

  return chat
})
