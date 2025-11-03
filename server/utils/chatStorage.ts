import { put, head, list, del } from '@vercel/blob'

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

export interface AccessLog {
  timestamp: string
  action: 'created' | 'viewed' | 'updated' | 'deleted'
  ip?: string
  region?: string
  country?: string
  city?: string
  userAgent?: string
  device?: string
  browser?: string
  browserVersion?: string
  os?: string
  referrer?: string
  url?: string
  method?: string
  language?: string
  timezone?: string
  isBot?: boolean
  sessionId?: string
}

export interface ChatWithLogs extends Chat {
  accessLogs?: AccessLog[]
}

// Cache of blob URLs to avoid looking them up repeatedly
// This persists across function invocations in the same instance
const blobUrlCache = new Map<string, string>()

// Store ID extracted from blob URLs (persists across module reloads using globalThis)
const globalStoreIdKey = '__plantuml_blob_store_id__'

declare global {
  // eslint-disable-next-line no-var
  var __plantuml_blob_store_id__: string | undefined
}

function getCachedStoreId(): string | null {
  return globalThis[globalStoreIdKey] || null
}

function setCachedStoreId(storeId: string): void {
  globalThis[globalStoreIdKey] = storeId
}

// Extract store ID from a blob URL
// Vercel Blob URLs follow: https://[store-id].public.blob.vercel-storage.com/[path]
function extractStoreId(blobUrl: string): string | null {
  try {
    const url = new URL(blobUrl)
    const hostname = url.hostname
    // Pattern: [store-id].public.blob.vercel-storage.com
    const match = hostname.match(/^([^.]+)\.public\.blob\.vercel-storage\.com$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function getChat(id: string): Promise<Chat | null> {
  try {
    const blobPath = `chats/${id}.json`
    
    // Try to get URL from cache first
    let blobUrl = blobUrlCache.get(id)
    
    if (!blobUrl) {
      // If not cached, try constructing the URL using store ID
      // Vercel Blob public URLs follow: https://[store-id].public.blob.vercel-storage.com/[path]
      const storeId = getCachedStoreId() || process.env.BLOB_STORE_ID
      if (storeId) {
        blobUrl = `https://${storeId}.public.blob.vercel-storage.com/${blobPath}`
      }
    }
    
    // If we have a URL (cached or constructed), try fetching from it
    if (blobUrl) {
      try {
        const response = await fetch(blobUrl)
        
        if (response.ok) {
          const content = await response.text()
          const chat = JSON.parse(content) as Chat
          
          // Cache the URL for future retrievals
          if (!blobUrlCache.has(id)) {
            blobUrlCache.set(id, blobUrl)
          }
          
          // Extract and cache the store ID from the successful fetch URL
          const storeId = extractStoreId(blobUrl)
          if (storeId && !getCachedStoreId()) {
            setCachedStoreId(storeId)
            console.log(`[ChatStorage] Extracted and cached store ID from fetch: ${storeId}`)
          }
          
          console.log(`[ChatStorage] Retrieved chat ${id} from blob`)
          return chat
        } else if (response.status === 404) {
          console.log(`[ChatStorage] Chat ${id} not found at ${blobUrl}`)
          // Remove from cache if it doesn't exist
          blobUrlCache.delete(id)
          // Continue to try using the API below
        } else {
          throw new Error(`Failed to fetch chat: ${response.status} ${response.statusText}`)
        }
      } catch (fetchError) {
        // If fetch fails, fall through to use the API
        console.log(`[ChatStorage] Fetch failed for ${id}, trying API:`, fetchError)
      }
    }
    
    // Fallback: Use Vercel Blob API to get the blob URL by pathname
    // This works even without the store ID
    try {
      const blobInfo = await head(blobPath)
      
      if (!blobInfo || !blobInfo.url) {
        console.log(`[ChatStorage] Chat ${id} not found via API`)
        return null
      }
      
      // Now fetch the blob content using the URL from head
      blobUrl = blobInfo.url
      const response = await fetch(blobUrl)
      
      if (!response.ok) {
        console.log(`[ChatStorage] Chat ${id} not found at ${blobUrl}`)
        return null
      }
      
      const content = await response.text()
      const chat = JSON.parse(content) as Chat
      
      // Cache the URL for future retrievals
      blobUrlCache.set(id, blobUrl)
      
      // Extract and cache the store ID from the blob URL
      const storeId = extractStoreId(blobUrl)
      if (storeId && !getCachedStoreId()) {
        setCachedStoreId(storeId)
        console.log(`[ChatStorage] Extracted and cached store ID from API: ${storeId}`)
      }
      
      console.log(`[ChatStorage] Retrieved chat ${id} from blob API`)
      return chat
    } catch (apiError: any) {
      // Check if it's a 404 or not found error
      if (apiError?.status === 404 || apiError?.statusCode === 404 || apiError?.name === 'BlobNotFoundError') {
        console.log(`[ChatStorage] Chat ${id} not found via API (404)`)
        return null
      }
      throw apiError
    }
  } catch (error) {
    console.error(`[ChatStorage] Error getting chat ${id}:`, error)
    return null
  }
}

export async function saveChat(chat: Chat): Promise<void> {
  try {
    chat.updatedAt = new Date().toISOString()
    const blobPath = `chats/${chat.id}.json`
    const content = JSON.stringify(chat)
    
    const blob = await put(blobPath, content, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    })
    
    // Cache the URL for faster retrieval
    blobUrlCache.set(chat.id, blob.url)
    
    // Extract and cache the store ID from the blob URL for future use
    const storeId = extractStoreId(blob.url)
    if (storeId && !getCachedStoreId()) {
      setCachedStoreId(storeId)
      console.log(`[ChatStorage] Cached store ID: ${storeId}`)
    }
    
    console.log(`[ChatStorage] Saved chat ${chat.id} to blob at ${blob.url}`)
  } catch (error) {
    console.error(`[ChatStorage] Error saving chat ${chat.id}:`, error)
    throw error
  }
}

export async function createChat(messages: Message[]): Promise<Chat> {
  const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
  const now = new Date().toISOString()
  
  const chat: Chat = {
    id,
    messages,
    createdAt: now,
    updatedAt: now
  }
  
  await saveChat(chat)
  console.log(`[ChatStorage] Created chat ${id}`)
  return chat
}

// Get or create access logs for a chat
async function getAccessLogs(chatId: string, fresh: boolean = false): Promise<AccessLog[]> {
  try {
    const logPath = `chats/${chatId}_logs.json`
    
    // Always try to get fresh URL using head API to avoid stale cache
    try {
      const blobInfo = await head(logPath)
      if (blobInfo?.url) {
        // Fetch with cache-busting query parameter to ensure fresh data
        const freshUrl = `${blobInfo.url}?t=${Date.now()}`
        const response = await fetch(freshUrl, {
          cache: 'no-store'
        })
        if (response.ok) {
          const content = await response.text()
          const logs = JSON.parse(content) as AccessLog[]
          // Ensure it's an array and not corrupted
          if (Array.isArray(logs)) {
            blobUrlCache.set(`${chatId}_logs`, blobInfo.url)
            return logs
          } else {
            console.warn(`[ChatStorage] Invalid log format for ${chatId}, resetting`)
            return []
          }
        }
      }
    } catch (headError) {
      // If head fails, log file might not exist yet, which is fine
      console.log(`[ChatStorage] Log file doesn't exist yet for ${chatId}`)
    }
    
    // Fallback: Try cached URL if head didn't work
    const logUrl = blobUrlCache.get(`${chatId}_logs`)
    if (logUrl && !fresh) {
      try {
        const response = await fetch(`${logUrl}?t=${Date.now()}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const content = await response.text()
          const logs = JSON.parse(content) as AccessLog[]
          if (Array.isArray(logs)) {
            return logs
          }
        }
      } catch {}
    }
    
    // If all else fails, try constructing URL from store ID
    const storeId = getCachedStoreId() || process.env.BLOB_STORE_ID
    if (storeId) {
      const constructedUrl = `https://${storeId}.public.blob.vercel-storage.com/${logPath}`
      try {
        const response = await fetch(`${constructedUrl}?t=${Date.now()}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const content = await response.text()
          const logs = JSON.parse(content) as AccessLog[]
          if (Array.isArray(logs)) {
            blobUrlCache.set(`${chatId}_logs`, constructedUrl)
            return logs
          }
        }
      } catch {}
    }
    
    return []
  } catch (error) {
    console.error(`[ChatStorage] Error getting access logs for ${chatId}:`, error)
    return []
  }
}

// Save access logs for a chat
async function saveAccessLogs(chatId: string, logs: AccessLog[]): Promise<void> {
  try {
    const logPath = `chats/${chatId}_logs.json`
    
    // Ensure logs is an array
    if (!Array.isArray(logs)) {
      console.error(`[ChatStorage] Attempted to save non-array logs for ${chatId}`)
      return
    }
    
    // Remove duplicates based on timestamp (shouldn't happen, but safety check)
    const uniqueLogs = logs.filter((log, index, self) => 
      index === self.findIndex(l => l.timestamp === log.timestamp && l.action === log.action)
    )
    
    const content = JSON.stringify(uniqueLogs, null, 2)
    
    const blob = await put(logPath, content, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    })
    
    blobUrlCache.set(`${chatId}_logs`, blob.url)
    console.log(`[ChatStorage] Saved ${uniqueLogs.length} access logs for ${chatId}`)
  } catch (error) {
    console.error(`[ChatStorage] Error saving access logs for ${chatId}:`, error)
    throw error
  }
}

// Add an access log entry
export async function logChatAccess(
  chatId: string,
  action: 'created' | 'viewed' | 'updated' | 'deleted',
  requestInfo: Partial<AccessLog>
): Promise<void> {
  try {
    // Always fetch fresh logs to avoid race conditions
    const logs = await getAccessLogs(chatId, true)
    
    // Create new log entry
    const newLog: AccessLog = {
      timestamp: new Date().toISOString(),
      action,
      ...requestInfo
    }
    
    // Ensure we have an array
    const updatedLogs = Array.isArray(logs) ? [...logs] : []
    updatedLogs.push(newLog)
    
    console.log(`[ChatStorage] Logging ${action} for chat ${chatId}, total logs: ${updatedLogs.length}`)
    await saveAccessLogs(chatId, updatedLogs)
  } catch (error) {
    console.error(`[ChatStorage] Error logging access for ${chatId}:`, error)
  }
}

// Delete a chat and its logs
export async function deleteChat(chatId: string): Promise<void> {
  try {
    // Delete the chat file
    const chatPath = `chats/${chatId}.json`
    const chatUrl = blobUrlCache.get(chatId)
    
    if (chatUrl) {
      await del(chatUrl)
    } else {
      // Try to get the URL using head
      try {
        const blobInfo = await head(chatPath)
        if (blobInfo?.url) {
          await del(blobInfo.url)
        }
      } catch {}
    }
    
    // Delete the log file
    const logPath = `chats/${chatId}_logs.json`
    const logUrl = blobUrlCache.get(`${chatId}_logs`)
    
    if (logUrl) {
      await del(logUrl)
    } else {
      try {
        const blobInfo = await head(logPath)
        if (blobInfo?.url) {
          await del(blobInfo.url)
        }
      } catch {}
    }
    
    // Remove from cache
    blobUrlCache.delete(chatId)
    blobUrlCache.delete(`${chatId}_logs`)
    
    console.log(`[ChatStorage] Deleted chat ${chatId} and its logs`)
  } catch (error) {
    console.error(`[ChatStorage] Error deleting chat ${chatId}:`, error)
    throw error
  }
}

// Get access logs for a chat (always fetch fresh)
export async function getChatAccessLogs(chatId: string): Promise<AccessLog[]> {
  const logs = await getAccessLogs(chatId, true)
  // Sort by timestamp descending (most recent first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// List all chats
export async function listAllChats(): Promise<Array<{ id: string; createdAt: string; updatedAt: string; messageCount: number }>> {
  try {
    const result = await list({
      prefix: 'chats/',
      limit: 1000
    })
    
    const chats = []
    for (const blob of result.blobs) {
      // Skip log files
      if (blob.pathname.endsWith('_logs.json')) continue
      
      // Extract chat ID from pathname (chats/{id}.json)
      const match = blob.pathname.match(/^chats\/([^/]+)\.json$/)
      if (!match) continue
      
      const chatId = match[1]
      
      // Try to get chat info
      try {
        const chat = await getChat(chatId)
        if (chat) {
          chats.push({
            id: chat.id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            messageCount: chat.messages?.length || 0
          })
        }
      } catch {
        // If we can't load it, still include basic info
        chats.push({
          id: chatId,
          createdAt: blob.uploadedAt || new Date().toISOString(),
          updatedAt: blob.uploadedAt || new Date().toISOString(),
          messageCount: 0
        })
      }
    }
    
    // Sort by updatedAt descending
    chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    return chats
  } catch (error) {
    console.error('[ChatStorage] Error listing chats:', error)
    return []
  }
}
