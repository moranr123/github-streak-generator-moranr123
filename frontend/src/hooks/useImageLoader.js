import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook to handle image loading with retry and error handling
 * @param {string} imageUrl - URL of the image to load
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {object} - { loading, error, loaded, retryCount }
 */
export function useImageLoader(imageUrl, maxRetries = 3) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimeoutRef = useRef(null)

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false)
      setError(false)
      setLoaded(false)
      return
    }

    setLoading(true)
    setError(false)
    setLoaded(false)
    setRetryCount(0)

    const img = new Image()
    let isMounted = true

    img.onload = () => {
      if (isMounted) {
        setLoading(false)
        setError(false)
        setLoaded(true)
      }
    }

    img.onerror = () => {
      if (isMounted) {
        if (retryCount < maxRetries) {
          const newRetryCount = retryCount + 1
          setRetryCount(newRetryCount)
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              img.src = imageUrl
            }
          }, 1000 * Math.pow(2, retryCount))
        } else {
          setLoading(false)
          setError(true)
          setLoaded(false)
        }
      }
    }

    img.src = imageUrl

    // If image is already cached, trigger load immediately
    if (img.complete && img.naturalHeight !== 0) {
      if (isMounted) {
        setLoading(false)
        setError(false)
        setLoaded(true)
      }
    }

    return () => {
      isMounted = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      img.onload = null
      img.onerror = null
    }
  }, [imageUrl, maxRetries, retryCount])

  return { loading, error, loaded, retryCount }
}
