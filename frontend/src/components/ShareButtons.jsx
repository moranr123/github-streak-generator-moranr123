export function ShareButtons({
  cardUrl,
  username,
  shareUrl,
  exportFormat,
  onCopyHtmlCode,
  onCopyUrl,
  onDownloadCard
}) {
  if (!cardUrl) return null

  const getShareUrl = () => {
    return shareUrl || `${window.location.origin}${window.location.pathname}`
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `GitHub Contribution Streak - ${username}`,
          text: `Check out my GitHub contribution streak! 🔥`,
          url: getShareUrl()
        })
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback: copy share URL to clipboard
      const url = getShareUrl()
      navigator.clipboard.writeText(url).then(() => {
        // Could show a toast notification here if needed
      }).catch(err => {
        console.error('Failed to copy URL:', err)
      })
    }
  }

  return (
    <div className="action-buttons">
      <div className="social-share-section">
        <label className="link-label">Share & Download</label>
        <div className="social-buttons">
          {navigator.share ? (
            <button
              onClick={shareNative}
              className="social-button native"
              title="Share via native share"
              aria-label="Share using device share menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Share</span>
            </button>
          ) : null}
          <button 
            onClick={onDownloadCard} 
            className="social-button download-button"
            aria-label={`Download card as ${exportFormat.toUpperCase()} format`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download ({exportFormat.toUpperCase()})</span>
          </button>
        </div>
      </div>

      <div className="link-section">
        <label className="link-label">HTML Code</label>
        <div className="link-item">
          <code className="link-text">{`<img src="${cardUrl}" alt="GitHub Streak Card" />`}</code>
          <button 
            onClick={onCopyHtmlCode} 
            className="copy-icon-button" 
            title="Copy HTML Code"
            aria-label="Copy HTML code to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="link-section">
        <label className="link-label">Markdown Link</label>
        <div className="link-item">
          <code className="link-text">{`![GitHub Streak Card](${cardUrl})`}</code>
          <button 
            onClick={onCopyUrl} 
            className="copy-icon-button" 
            title="Copy Markdown Link"
            aria-label="Copy Markdown link to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
