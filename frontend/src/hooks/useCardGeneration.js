import { useState, useCallback, useRef, useEffect } from 'react'
import { validateUsername } from '../utils/validation'
import { generateCardUrl } from '../utils/cardUtils'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/streak'

/**
 * Custom hook for card generation logic
 */
export function useCardGeneration(apiBase = API_BASE) {
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [cardLoaded, setCardLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [rateLimitInfo, setRateLimitInfo] = useState({ remaining: null, reset: null })
  
  const retryTimeoutRef = useRef(null)
  const isOnline = navigator.onLine

  // Retry mechanism with exponential backoff
  const retryRequest = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (err) {
        if (attempt === maxRetries - 1) throw err
        const backoffDelay = delay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
  }, [])

  const generateCard = useCallback(async (username, customization) => {
    const validation = validateUsername(username)
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    if (!isOnline) {
      setError('You are currently offline. Please check your internet connection.')
      return
    }

    setLoading(true)
    setImageLoading(true)
    setError('')
    setImageError(false)
    setCardLoaded(false)
    setRetryCount(0)
    
    try {
      const baseUrl = generateCardUrl(apiBase, username.trim(), customization)
      // Add timestamp to prevent browser caching
      const url = `${baseUrl}&_t=${Date.now()}`
      
      await retryRequest(async () => {
        setCardUrl(url)
        return Promise.resolve()
      })
    } catch (err) {
      setError('Failed to generate card. Please check the username and try again.')
      setImageLoading(false)
      setImageError(true)
    } finally {
      setLoading(false)
    }
  }, [apiBase, isOnline, retryRequest])

  const updateCardUrl = useCallback((username, customization) => {
    if (!username.trim()) return
    
    setImageLoading(true)
    setImageError(false)
    setError('')
    const baseUrl = generateCardUrl(apiBase, username, customization)
    // Add timestamp to prevent browser caching
    const url = `${baseUrl}&_t=${Date.now()}`
    setCardUrl(url)
  }, [apiBase])

  const handleImageLoad = useCallback((e) => {
    if (e.target && e.target.complete && e.target.naturalHeight !== 0) {
      setImageLoading(false)
      setImageError(false)
      setError('')
      setCardLoaded(true)
    }
  }, [])

  const handleImageError = useCallback(async (e) => {
    setImageLoading(false)
    setImageError(true)
    
    const img = e.target
    if (img && img.src) {
      try {
        const res = await fetch(img.src)
        
        const remaining = res.headers.get('x-ratelimit-remaining')
        const reset = res.headers.get('x-ratelimit-reset')
        if (remaining !== null) {
          setRateLimitInfo({ 
            remaining: parseInt(remaining), 
            reset: reset ? new Date(parseInt(reset) * 1000) : null 
          })
        }
        
        if (res.status === 404) {
          setError('User not found. Please check the username and try again.')
        } else if (res.status === 403) {
          const resetTime = reset ? new Date(parseInt(reset) * 1000).toLocaleTimeString() : 'later'
          setError(`Rate limit exceeded. Please try again at ${resetTime}.`)
        } else if (res.status >= 500) {
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1)
            retryTimeoutRef.current = setTimeout(() => {
              // Retry logic would need username and customization
              setImageLoading(true)
              setImageError(false)
            }, 1000 * Math.pow(2, retryCount))
          } else {
            setError('Server error. Please try again later.')
          }
        } else {
          try {
            const errorData = await res.json()
            setError(errorData.error || 'Failed to load card. Please try again.')
          } catch {
            setError('Failed to load card. Please try again.')
          }
        }
      } catch {
        if (!isOnline) {
          setError('You are currently offline. Please check your internet connection.')
        } else {
          setError('Unable to load card. Please check your connection and try again.')
        }
      }
    } else {
      setError('Failed to load card. Please try again.')
    }
  }, [retryCount, isOnline])

  // Handle cached images
  useEffect(() => {
    if (cardUrl && imageLoading) {
      const img = new Image()
      let isMounted = true
      
      img.onload = () => {
        if (isMounted) {
          setImageLoading(false)
          setImageError(false)
          setCardLoaded(true)
        }
      }
      img.onerror = () => {
        if (isMounted) {
          setImageLoading(false)
          setImageError(true)
        }
      }
      img.src = cardUrl
      
      if (img.complete && img.naturalHeight !== 0) {
        if (isMounted) {
          setImageLoading(false)
          setImageError(false)
          setCardLoaded(true)
        }
      }
      
      return () => {
        isMounted = false
        img.onload = null
        img.onerror = null
      }
    }
  }, [cardUrl, imageLoading])

  // Cleanup retry timeout
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    cardUrl,
    loading,
    imageLoading,
    error,
    imageError,
    cardLoaded,
    rateLimitInfo,
    generateCard,
    updateCardUrl,
    handleImageLoad,
    handleImageError,
    setError
  }
}
