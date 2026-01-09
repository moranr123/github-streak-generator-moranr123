import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './App.css'
import statsIcon from './assets/stats-icon.svg'
import { useDebounce } from './hooks/useDebounce'
import { useCardGeneration } from './hooks/useCardGeneration'
import { useCustomization } from './hooks/useCustomization'
import { CardGenerator } from './components/CardGenerator'
import { CustomizationPanel } from './components/CustomizationPanel'
import { CardPreview } from './components/CardPreview'
import { ShareButtons } from './components/ShareButtons'
import { InstructionsModal } from './components/InstructionsModal'
import { downloadCard } from './utils/downloadUtils'
import { generateCardUrl, buildShareUrl } from './utils/cardUtils'
import { GITHUB_REPO_URL } from './utils/constants'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/streak'

function App() {
  const [username, setUsername] = useState('')
  const debouncedUsername = useDebounce(username, 500)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return true // Default to dark mode
  })
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [showInstructions, setShowInstructions] = useState(false)
  
  const usernameInputRef = useRef(null)
  
  // Custom hooks
  const customization = useCustomization()
  const {
    cardUrl,
    loading,
    imageLoading,
    error,
    imageError,
    cardLoaded,
    generateCard,
    updateCardUrl,
    handleImageLoad,
    handleImageError,
    setError
  } = useCardGeneration(API_BASE)

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      setError('You are currently offline. Please check your internet connection.')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setError])

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Clear form on page load/refresh
  useEffect(() => {
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  // Update URL only when card is generated (not on every field change)

  // Handle card generation
  const handleGenerate = () => {
    generateCard(username, customization.getCustomization())
    
    // Update URL only when card is generated
    const params = buildShareUrl(username, customization.getCustomization())
    const newUrl = params.replace(window.location.origin, '')
    window.history.replaceState({}, '', newUrl)
  }

  // Handle customization changes that should update card immediately
  const handleThemeChange = (e) => {
    customization.setTheme(e.target.value)
    if (username.trim()) {
      updateCardUrl(username, { ...customization.getCustomization(), theme: e.target.value })
    }
  }

  const handleFontSizeChange = (e) => {
    customization.setFontSize(e.target.value)
    if (username.trim()) {
      updateCardUrl(username, { ...customization.getCustomization(), fontSize: e.target.value })
    }
  }

  const handleHideAvatarChange = (e) => {
    const newHideAvatar = e.target.checked
    customization.setHideAvatar(newHideAvatar)
    if (username.trim()) {
      updateCardUrl(username, { ...customization.getCustomization(), hideAvatar: newHideAvatar })
    }
  }

  const handleCardWidthBlur = (e) => {
    const result = customization.handleCardWidthBlur(e)
    if (username.trim() && !result.error && result.changed) {
      updateCardUrl(username, { ...customization.getCustomization(), cardWidth: result.newWidth })
    }
  }

  const handleCardHeightBlur = (e) => {
    const result = customization.handleCardHeightBlur(e)
    if (username.trim() && !result.error && result.changed) {
      updateCardUrl(username, { ...customization.getCustomization(), cardHeight: result.newHeight })
    }
  }

  // Toast notification - memoized
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }, [])

  // Clipboard and download functions - memoized with useCallback
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied to clipboard!', 'success')
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }, [showToast])

  const handleDownloadCard = useCallback(async () => {
    if (!cardUrl) {
      showToast('Please generate a card first', 'error')
      return
    }
    try {
      await downloadCard(cardUrl, username, customization.exportFormat)
      showToast(`Card downloaded as ${customization.exportFormat.toUpperCase()}!`, 'success')
    } catch (err) {
      showToast('Unable to download card. Please try again.', 'error')
    }
  }, [cardUrl, username, customization.exportFormat, showToast])

  const handleCopyHtmlCode = useCallback(() => {
    if (!cardUrl) {
      alert('Please generate a card first')
      return
    }
    const htmlCode = `<img src="${cardUrl}" alt="GitHub Streak Card" />`
    copyToClipboard(htmlCode)
  }, [cardUrl, copyToClipboard])

  const handleCopyUrl = useCallback(() => {
    if (!cardUrl) {
      alert('Please generate a card first')
      return
    }
    const markdownLink = `![GitHub Streak Card](${cardUrl})`
    copyToClipboard(markdownLink)
  }, [cardUrl, copyToClipboard])

  const getShareUrl = useCallback(() => {
    return buildShareUrl(username, customization.getCustomization())
  }, [username, customization])

  const handleShareUrl = useCallback(() => {
    copyToClipboard(getShareUrl)
  }, [getShareUrl, copyToClipboard])

  return (
    <div className="app" role="main">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <button 
        className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
        onClick={() => setDarkMode(!darkMode)}
        aria-label={`Toggle dark mode. Currently ${darkMode ? 'enabled' : 'disabled'}`}
        title={`Toggle dark mode (Currently ${darkMode ? 'on' : 'off'})`}
        role="switch"
        aria-checked={darkMode}
        tabIndex={0}
      >
        <span className="toggle-track">
          <span className="toggle-handle">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toggle-icon">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toggle-icon">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </span>
        </span>
      </button>
      
      <div className="container">
        <header role="banner">
          <div className="header-content">
            <div className="header-title">
              <img src={statsIcon} alt="Stats icon" className="stats-logo" />
              <h1>Github stats generator</h1>
              <button
                className="info-icon-button"
                onClick={() => setShowInstructions(true)}
                aria-label="Show instructions"
                title="Click for instructions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
            </div>
            <div className="header-actions">
              <button
                className="github-action-button star-button"
                onClick={() => window.open(GITHUB_REPO_URL, '_blank', 'noopener,noreferrer')}
                aria-label="Star this repository on GitHub"
                title="Star this repository on GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                </svg>
                <span className="button-label">Star</span>
              </button>
              <button
                className="github-action-button fork-button"
                onClick={() => window.open(`${GITHUB_REPO_URL}/fork`, '_blank', 'noopener,noreferrer')}
                aria-label="Fork this repository on GitHub"
                title="Fork this repository on GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 1-3 2.122v.878A2.25 2.25 0 0 1 5.75 10.5h1.5v2.128a2.251 2.251 0 1 1-1.5 0v-.878a2.25 2.25 0 0 1-1.5-2.122v-.878a2.25 2.25 0 0 1 1.5-2.122ZM3.25 9a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm4.5 4.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5.75 9a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Zm-1.5-2.378a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm13.5 0a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0ZM13.25 9a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM9 12.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm3.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM9 3.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM12.25 4a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-1.5 1.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-7 0a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5Zm1.5-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path>
                </svg>
                <span className="button-label">Fork</span>
              </button>
            </div>
          </div>
        </header>

        <div className="main-content" id="main-content" tabIndex={-1}>
          <div className="card-and-theme">
            <div className="left-section">
              <CardGenerator
                username={username}
                onUsernameChange={setUsername}
                loading={loading}
                isOnline={isOnline}
                error={error}
                inputRef={usernameInputRef}
                statType={customization.statType}
                onStatTypeChange={(value) => {
                  customization.setStatType(value)
                  if (username.trim()) {
                    updateCardUrl(username, { ...customization.getCustomization(), statType: value })
                  }
                }}
              />

              <CustomizationPanel
                statType={customization.statType}
                theme={customization.theme}
                fontSize={customization.fontSize}
                hideAvatar={customization.hideAvatar}
                cardWidth={customization.cardWidth}
                cardHeight={customization.cardHeight}
                exportFormat={customization.exportFormat}
                displaySections={customization.displaySections}
                widthError={customization.widthError}
                heightError={customization.heightError}
                onThemeChange={handleThemeChange}
                onFontSizeChange={handleFontSizeChange}
                onHideAvatarChange={handleHideAvatarChange}
                onCardWidthChange={customization.handleCardWidthChange}
                onCardWidthBlur={handleCardWidthBlur}
                onCardHeightChange={customization.handleCardHeightChange}
                onCardHeightBlur={handleCardHeightBlur}
                onExportFormatChange={(e) => customization.setExportFormat(e.target.value)}
                onDisplaySectionsChange={(newSections) => {
                  customization.setDisplaySections(newSections)
                  if (username.trim() && (customization.statType === 'streak' || customization.statType === 'repository_stats')) {
                    updateCardUrl(username, { ...customization.getCustomization(), displaySections: newSections })
                  }
                }}
              />

              <button 
                id="generate-button"
                onClick={handleGenerate} 
                disabled={loading || !isOnline} 
                className="submit-button"
                aria-label="Generate GitHub streak card"
                aria-describedby={loading ? 'generating-status' : undefined}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span aria-live="polite" id="generating-status">Generating...</span>
                    <span className="sr-only">Please wait while the card is being generated</span>
                  </>
                ) : (
                  'Generate Card'
                )}
              </button>

              {error && (
                <div className="error" role="alert" aria-live="polite" id="error-message">
                  {error}
                </div>
              )}
              
              
              {!isOnline && (
                <div className="offline-indicator" role="status" aria-live="polite">
                  🔌 You are currently offline
                </div>
              )}
            </div>

            <div className="card-section">
              <CardPreview
                cardUrl={cardUrl}
                username={username}
                imageLoading={imageLoading}
                imageError={imageError}
                cardLoaded={cardLoaded}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
                apiBase={API_BASE}
                customization={customization.getCustomization()}
              />
              
              {!imageLoading && !imageError && cardUrl && (
                <ShareButtons
                  cardUrl={cardUrl}
                  username={username}
                  shareUrl={getShareUrl()}
                  exportFormat={customization.exportFormat}
                  onCopyHtmlCode={handleCopyHtmlCode}
                  onCopyUrl={handleCopyUrl}
                  onDownloadCard={handleDownloadCard}
                />
              )}
            </div>
          </div>
        </div>

        <footer role="contentinfo" className="app-footer">
          <p>&copy; {new Date().getFullYear()} GitHub Stats Generator. All rights reserved.</p>
        </footer>
      </div>
      
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
      
      <InstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
    </div>
  )
}

export default App
