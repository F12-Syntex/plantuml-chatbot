import { getChat, saveChat } from '../../utils/chatStorage'

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

  // Re-save the chat to ensure it persists (refresh the storage entry)
  // This helps prevent chats from being lost
  await saveChat(chat)

  return chat
})
