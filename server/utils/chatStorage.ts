interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface Chat {
  id: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// In-memory storage for chats
const chatStorage = new Map<string, Chat>()

export function getChat(id: string): Chat | undefined {
  return chatStorage.get(id)
}

export function saveChat(chat: Chat): void {
  chatStorage.set(chat.id, chat)
}

export function createChat(messages: Message[]): Chat {
  const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
  const now = new Date().toISOString()
  
  const chat: Chat = {
    id,
    messages,
    createdAt: now,
    updatedAt: now
  }
  
  chatStorage.set(id, chat)
  return chat
}

