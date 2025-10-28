export default defineEventHandler(async () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenRouter API key not configured'
    })
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: 'Failed to fetch models'
    })
  }

  const data = await response.json()
  
  const textOnlyModels = data.data.filter((model: any) => {
    const modality = model.architecture?.modality || ''
    return modality.startsWith('text->') || modality === 'text->text'
  })
  
  return textOnlyModels
})