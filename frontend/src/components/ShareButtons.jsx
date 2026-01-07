export function ShareButtons({
  cardUrl,
  username,
  shareUrl,
  exportFormat,
  onCopyHtmlCode,
  onCopyUrl,
  onShareUrl,
  onDownloadCard
}) {
  if (!cardUrl) return null

  const getShareUrl = () => {
    return shareUrl || `${window.location.origin}${window.location.pathname}`
  }

  const shareToTwitter = () => {
    const text = `Check out my GitHub contribution streak! 🔥`
    const url = getShareUrl()
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareToLinkedIn = () => {
    const url = getShareUrl()
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(linkedInUrl, '_blank', 'width=550,height=420')
  }

  const shareToReddit = () => {
    const text = `Check out my GitHub contribution streak!`
    const url = getShareUrl()
    const redditUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(redditUrl, '_blank', 'width=550,height=420')
  }

  return (
    <div className="action-buttons">
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
      <div className="link-section">
        <label className="link-label">Share URL</label>
        <div className="link-item">
          <code className="link-text">{getShareUrl()}</code>
          <button 
            onClick={onShareUrl} 
            className="copy-icon-button" 
            title="Copy Share URL"
            aria-label="Copy share URL to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
      <button 
        onClick={onDownloadCard} 
        className="download-button"
        aria-label={`Download card as ${exportFormat.toUpperCase()} format`}
      >
        Download ({exportFormat.toUpperCase()})
      </button>
    </div>
  )
}
