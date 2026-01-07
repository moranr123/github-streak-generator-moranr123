/**
 * Validate GitHub username format
 * @param {string} username - Username to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export function validateUsername(username) {
  if (!username.trim()) {
    return { valid: false, message: 'Please enter a GitHub username' }
  }
  
  // GitHub username rules: alphanumeric and hyphens, 1-39 characters, cannot start/end with hyphen
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,37}[a-zA-Z0-9]$/
  
  if (!usernameRegex.test(username.trim())) {
    return { valid: false, message: 'Invalid GitHub username format' }
  }
  
  return { valid: true }
}

import { CARD_DIMENSIONS } from './constants.js'

/**
 * Validate card width
 * @param {number|string} width - Width to validate
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
export function validateCardWidth(width) {
  const { MIN, MAX, DEFAULT } = CARD_DIMENSIONS.WIDTH
  const numValue = typeof width === 'number' ? width : parseInt(width)
  
  if (isNaN(numValue) || numValue < 1) {
    return { valid: false, error: 'Please enter a valid width', value: DEFAULT }
  }
  
  if (numValue < MIN) {
    return { valid: false, error: `Width must be at least ${MIN}px`, value: MIN }
  }
  
  if (numValue > MAX) {
    return { valid: false, error: `Width must be at most ${MAX}px`, value: MAX }
  }
  
  return { valid: true, error: '', value: numValue }
}

/**
 * Validate card height
 * @param {number|string} height - Height to validate
 * @returns {object} - { valid: boolean, error: string, value: number }
 */
export function validateCardHeight(height) {
  const { MIN, MAX, DEFAULT } = CARD_DIMENSIONS.HEIGHT
  const numValue = typeof height === 'number' ? height : parseInt(height)
  
  if (isNaN(numValue) || numValue < 1) {
    return { valid: false, error: 'Please enter a valid height', value: DEFAULT }
  }
  
  if (numValue < MIN) {
    return { valid: false, error: `Height must be at least ${MIN}px`, value: MIN }
  }
  
  if (numValue > MAX) {
    return { valid: false, error: `Height must be at most ${MAX}px`, value: MAX }
  }
  
  return { valid: true, error: '', value: numValue }
}
