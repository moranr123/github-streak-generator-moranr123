/**
 * Generate card URL with query parameters
 * @param {string} apiBase - Base API URL
 * @param {string} username - GitHub username
 * @param {object} customization - Customization options
 * @returns {string} Generated card URL
 */
export function generateCardUrl(apiBase, username, customization) {
  const { theme, fontSize, hideAvatar, cardWidth, cardHeight } = customization
  const params = new URLSearchParams()
  
  const colorToUse = theme ? theme.replace('#', '') : ''
  if (colorToUse && colorToUse.trim()) {
    params.append('theme', colorToUse)
  }
  
  if (fontSize && fontSize !== 'normal') {
    params.append('fontSize', fontSize)
  }
  
  if (hideAvatar) {
    params.append('hideAvatar', 'true')
  }
  
  const widthValue = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) : 800)
  const heightValue = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) : 400)
  
  if (widthValue && !isNaN(widthValue) && widthValue !== 800) {
    params.append('cardWidth', widthValue.toString())
  }
  
  if (heightValue && !isNaN(heightValue) && heightValue !== 400) {
    params.append('cardHeight', heightValue.toString())
  }
  
  const queryString = params.toString()
  return queryString ? `${apiBase}/card/${username}?${queryString}` : `${apiBase}/card/${username}`
}
