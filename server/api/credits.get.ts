export default defineEventHandler(async () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenRouter API key not configured'
    })
  }

  const response = await fetch('https://openrouter.ai/api/v1/credits', {
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'Failed to fetch credits'
    })
  }

  const data = await response.json()
  return data
})