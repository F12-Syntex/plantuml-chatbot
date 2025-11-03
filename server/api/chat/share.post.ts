import { createChat } from '../../utils/chatStorage'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ messages: Message[] }>(event)
  
  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Messages array is required and must not be empty'
    })
  }

  const chat = createChat(body.messages)

  return { id: chat.id }
})

