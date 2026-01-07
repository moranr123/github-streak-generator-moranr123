import { describe, it, expect } from 'vitest'
import { validateUsername, validateCardWidth, validateCardHeight } from '../validation.js'

describe('validateUsername', () => {
  it('should reject empty username', () => {
    const result = validateUsername('')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('enter a GitHub username')
  })

  it('should reject username with spaces', () => {
    const result = validateUsername('user name')
    expect(result.valid).toBe(false)
  })

  it('should accept valid username', () => {
    const result = validateUsername('octocat')
    expect(result.valid).toBe(true)
  })

  it('should reject username starting with hyphen', () => {
    const result = validateUsername('-username')
    expect(result.valid).toBe(false)
  })

  it('should reject username ending with hyphen', () => {
    const result = validateUsername('username-')
    expect(result.valid).toBe(false)
  })
})

describe('validateCardWidth', () => {
  it('should reject width below minimum', () => {
    const result = validateCardWidth(300)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at least')
  })

  it('should reject width above maximum', () => {
    const result = validateCardWidth(3000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at most')
  })

  it('should accept valid width', () => {
    const result = validateCardWidth(800)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(800)
  })
})

describe('validateCardHeight', () => {
  it('should reject height below minimum', () => {
    const result = validateCardHeight(100)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at least')
  })

  it('should reject height above maximum', () => {
    const result = validateCardHeight(2000)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('at most')
  })

  it('should accept valid height', () => {
    const result = validateCardHeight(400)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(400)
  })
})
