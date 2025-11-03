import { put } from '@vercel/blob'

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
      } else {
        // If we don't have store ID and URL not cached, we can't retrieve it
        console.log(`[ChatStorage] Chat ${id} not found in cache and no store ID available`)
        return null
      }
    }
    
    // Fetch the blob content from the public URL
    const response = await fetch(blobUrl)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[ChatStorage] Chat ${id} not found at ${blobUrl}`)
        // Remove from cache if it doesn't exist
        blobUrlCache.delete(id)
        return null
      }
      throw new Error(`Failed to fetch chat: ${response.status} ${response.statusText}`)
    }
    
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
