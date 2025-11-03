import { listAllChats } from '../../utils/chatStorage'

export default defineEventHandler(async (event) => {
  const chats = await listAllChats()
  return chats
})

