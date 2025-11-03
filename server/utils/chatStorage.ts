import { put, head } from '@vercel/blob'

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
