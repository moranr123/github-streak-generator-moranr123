import { useState, useEffect, useRef } from 'react'
import { useImageLoader } from '../hooks/useImageLoader'

export function CardPreview({ cardUrl, username, imageLoading: externalLoading, onImageLoad, onImageError }) {
  const { loading: imageLoaderLoading, error: imageLoaderError, loaded } = useImageLoader(cardUrl)
  const [cardLoaded, setCardLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (loaded && !cardLoaded) {
      setCardLoaded(true)
      onImageLoad?.()
    }
  }, [loaded, cardLoaded, onImageLoad])

  const handleImageLoad = (e) => {
    if (e.target && e.target.complete && e.target.naturalHeight !== 0) {
      setCardLoaded(true)
      onImageLoad?.()
    }
  }

  const handleImageError = (e) => {
    onImageError?.(e)
  }

  const isLoading = externalLoading || imageLoaderLoading
  const hasError = imageLoaderError

  return (
    <div className="card-preview" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="skeleton-card" role="status" aria-live="polite" aria-label="Loading card">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-username"></div>
          </div>
          <div className="skeleton-stats">
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
            <div className="skeleton-stat"></div>
          </div>
          <div className="skeleton-footer"></div>
          <span className="sr-only">Loading GitHub streak card, please wait</span>
        </div>
      )}
      {hasError && (
        <div className="image-error">
          <p>⚠️</p>
          <p>Failed to load card</p>
        </div>
      )}
      {!hasError && cardUrl && (
        <img
          ref={imgRef}
          key={cardUrl}
          src={cardUrl}
          alt={`GitHub contribution streak card for ${username || 'user'}`}
          className={`card-image ${cardLoaded ? 'fade-in' : ''}`}
          style={{
            display: isLoading ? 'none' : 'block',
            position: 'relative',
            zIndex: 2
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}
