export function CardPreview({
  cardUrl,
  username,
  imageLoading,
  imageError,
  cardLoaded,
  onImageLoad,
  onImageError,
  apiBase,
  customization
}) {
  if (!cardUrl) {
    // Generate preview URL with current customization settings
    const previewParams = new URLSearchParams()
    if (customization?.theme) previewParams.set('theme', customization.theme)
    if (customization?.fontSize && customization.fontSize !== 'normal') previewParams.set('fontSize', customization.fontSize)
    if (customization?.hideAvatar) previewParams.set('hideAvatar', 'true')
    if (customization?.cardWidth) previewParams.set('cardWidth', customization.cardWidth)
    if (customization?.cardHeight) previewParams.set('cardHeight', customization.cardHeight)
    if (customization?.statType && customization.statType !== 'streak') previewParams.set('statType', customization.statType)
    // Add timestamp to prevent caching
    previewParams.set('_t', Date.now())
    
    const previewUrl = `${apiBase}/card/moranr123?${previewParams.toString()}`
    
    return (
      <div className="placeholder">
        <div className="preview-container">
          <img 
            src={previewUrl}
            alt="Preview example of GitHub streak card" 
            className="preview-image"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <p className="preview-note">This is just a preview</p>
          <p className="preview-instruction">Enter your GitHub username above to see your card</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-preview" style={{ position: 'relative' }}>
      {imageLoading && (
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
      {imageError && (
        <div className="image-error">
          <p>⚠️</p>
          <p>Failed to load card</p>
        </div>
      )}
      {!imageError && (
        <img 
          key={cardUrl} 
          src={cardUrl} 
          alt={`GitHub contribution streak card for ${username || 'user'}`}
          className={`card-image ${cardLoaded ? 'fade-in' : ''}`}
          style={{ 
            display: imageLoading ? 'none' : 'block',
            position: 'relative',
            zIndex: 2
          }}
          onLoad={onImageLoad}
          onError={onImageError}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}
