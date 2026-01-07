/**
 * Build URL search parameters from customization options
 * @param {object} customization - Customization options
 * @returns {URLSearchParams} URL search parameters
 */
export function buildCustomizationParams(customization) {
  const { statType, theme, fontSize, hideAvatar, cardWidth, cardHeight, displaySections } = customization;
  const params = new URLSearchParams();
  
  // Add statType if not default (streak)
  if (statType && statType !== 'streak') {
    params.append('statType', statType);
  }
  
  const colorToUse = theme ? theme.replace('#', '') : '';
  if (colorToUse && colorToUse.trim()) {
    params.append('theme', colorToUse);
  }
  
  if (fontSize && fontSize !== 'normal') {
    params.append('fontSize', fontSize);
  }
  
  if (hideAvatar) {
    params.append('hideAvatar', 'true');
  }
  
  // Add displaySections for streak cards
  if (statType === 'streak' && displaySections && typeof displaySections === 'object') {
    const enabledSections = Object.entries(displaySections)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
      .join(',');
    
    // Only add if not all sections are enabled (default)
    if (enabledSections && enabledSections !== 'total,current,longest') {
      params.append('displaySections', enabledSections);
    }
  }
  
  const widthValue = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) : 600);
  const heightValue = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) : 200);
  
  if (widthValue && !isNaN(widthValue) && widthValue !== 600) {
    params.append('cardWidth', widthValue.toString());
  }
  
  if (heightValue && !isNaN(heightValue) && heightValue !== 200) {
    params.append('cardHeight', heightValue.toString());
  }
  
  return params;
}

/**
 * Generate card URL with query parameters
 * @param {string} apiBase - Base API URL
 * @param {string} username - GitHub username
 * @param {object} customization - Customization options
 * @returns {string} Generated card URL
 */
export function generateCardUrl(apiBase, username, customization) {
  const params = buildCustomizationParams(customization);
  const queryString = params.toString();
  return queryString ? `${apiBase}/card/${username}?${queryString}` : `${apiBase}/card/${username}`;
}

/**
 * Build share URL from customization options
 * @param {string} username - GitHub username
 * @param {object} customization - Customization options
 * @returns {string} Share URL
 */
export function buildShareUrl(username, customization) {
  const params = buildCustomizationParams(customization);
  if (username) params.set('username', username);
  const queryString = params.toString();
  return queryString 
    ? `${window.location.origin}${window.location.pathname}?${queryString}`
    : `${window.location.origin}${window.location.pathname}`;
}
