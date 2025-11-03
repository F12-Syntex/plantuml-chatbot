// Utility to extract device information from User-Agent header

export interface DeviceInfo {
  device?: string
  browser?: string
  os?: string
  browserVersion?: string
  country?: string
  city?: string
  timezone?: string
  language?: string
  referrer?: string
  url?: string
  method?: string
  acceptLanguage?: string
  acceptEncoding?: string
  connectionType?: string
  isBot?: boolean
}

export function parseUserAgent(userAgent: string | undefined): DeviceInfo {
  if (!userAgent) return {}
  
  const info: DeviceInfo = {}
  
  // Check if it's a bot
  const botPatterns = /bot|crawler|spider|crawling|google|facebook|twitter|linkedin|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|facebot|ia_archiver/i
  info.isBot = botPatterns.test(userAgent)
  
  // Detect OS
  if (userAgent.includes('Windows NT')) {
    const versionMatch = userAgent.match(/Windows NT (\d+\.\d+)/)
    if (versionMatch) {
      const version = versionMatch[1]
      if (version === '10.0') info.os = 'Windows 10/11'
      else if (version === '6.3') info.os = 'Windows 8.1'
      else if (version === '6.2') info.os = 'Windows 8'
      else if (version === '6.1') info.os = 'Windows 7'
      else info.os = `Windows ${version}`
    } else {
      info.os = 'Windows'
    }
  } else if (userAgent.includes('Mac OS X')) {
    const versionMatch = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    if (versionMatch) {
      info.os = `macOS ${versionMatch[1].replace('_', '.')}`
    } else {
      info.os = 'macOS'
    }
  } else if (userAgent.includes('Linux')) {
    info.os = 'Linux'
  } else if (userAgent.includes('Android')) {
    const versionMatch = userAgent.match(/Android (\d+(?:\.\d+)?)/)
    info.os = versionMatch ? `Android ${versionMatch[1]}` : 'Android'
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    const versionMatch = userAgent.match(/OS (\d+[._]\d+)/)
    info.os = versionMatch ? `iOS ${versionMatch[1].replace('_', '.')}` : 'iOS'
  }
  
  // Detect Browser and Version
  const edgeMatch = userAgent.match(/Edg\/(\d+)/)
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/)
  const firefoxMatch = userAgent.match(/Firefox\/(\d+)/)
  const safariMatch = userAgent.match(/Version\/(\d+).*Safari/)
  const operaMatch = userAgent.match(/(?:OPR|Opera)\/(\d+)/)
  
  if (edgeMatch) {
    info.browser = 'Microsoft Edge'
    info.browserVersion = edgeMatch[1]
  } else if (chromeMatch && !userAgent.includes('Edg/')) {
    info.browser = 'Chrome'
    info.browserVersion = chromeMatch[1]
  } else if (firefoxMatch) {
    info.browser = 'Firefox'
    info.browserVersion = firefoxMatch[1]
  } else if (safariMatch && !userAgent.includes('Chrome/')) {
    info.browser = 'Safari'
    info.browserVersion = safariMatch[1]
  } else if (operaMatch) {
    info.browser = 'Opera'
    info.browserVersion = operaMatch[1]
  }
  
  // Detect Device Type
  if (userAgent.includes('Mobile')) {
    info.device = 'Mobile'
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    info.device = 'Tablet'
  } else {
    info.device = 'Desktop'
  }
  
  return info
}

export function getClientIP(event: any): string | undefined {
  // Try various headers for IP address
  const headers = event.node.req.headers
  return (
    headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    headers['x-client-ip'] ||
    event.node.req.socket?.remoteAddress
  )
}

export function getClientRegion(event: any): { region?: string; country?: string; city?: string } {
  // Try Cloudflare/Vercel region headers
  const headers = event.node.req.headers
  const result: { region?: string; country?: string; city?: string } = {}
  
  // Cloudflare headers
  if (headers['cf-ray']) {
    result.region = headers['cf-ray'].split('-')[1]
  }
  if (headers['cf-ipcountry']) {
    result.country = headers['cf-ipcountry'] as string
  }
  if (headers['cf-ipcity']) {
    result.city = headers['cf-ipcity'] as string
  }
  
  // Vercel headers
  if (headers['x-vercel-id']) {
    const parts = (headers['x-vercel-id'] as string).split('::')
    if (parts[1]) result.region = parts[1]
  }
  
  return result
}

export function getRequestInfo(event: any): Partial<DeviceInfo> {
  const headers = event.node.req.headers
  const url = event.node.req.url
  const method = event.node.req.method
  
  const info: Partial<DeviceInfo> = {
    referrer: headers.referer || headers.referrer,
    url: url,
    method: method,
    acceptLanguage: headers['accept-language'],
    acceptEncoding: headers['accept-encoding'],
    connectionType: headers.connection || headers['x-connection-type'],
    language: headers['accept-language']?.split(',')[0]?.split(';')[0]?.trim(),
  }
  
  // Extract timezone from Accept-Language or use UTC as fallback
  // Note: Server-side can't get client timezone without JavaScript, but we can log it if sent
  if (headers['x-timezone']) {
    info.timezone = headers['x-timezone'] as string
  }
  
  return info
}

