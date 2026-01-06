import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [theme, setTheme] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  // Card customization
  const [fontSize, setFontSize] = useState('normal')
  const [hideAvatar, setHideAvatar] = useState(false)
  const [cardSize, setCardSize] = useState('normal')
  
  // Export format
  const [exportFormat, setExportFormat] = useState('png')
  
  const themes = [
    { value: '58a6ff', label: 'Blue' },
    { value: '7c3aed', label: 'Purple' },
    { value: '10b981', label: 'Green' },
    { value: 'f59e0b', label: 'Amber' },
    { value: 'ef4444', label: 'Red' },
    { value: '06b6d4', label: 'Cyan' },
    { value: 'ec4899', label: 'Pink' },
    { value: '8b5cf6', label: 'Violet' }
  ]

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/streak'
  
  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])
  
  // Load from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlUsername = params.get('username')
    const urlTheme = params.get('theme')
    const urlFontSize = params.get('fontSize')
    const urlHideAvatar = params.get('hideAvatar')
    const urlCardSize = params.get('cardSize')
    
    if (urlUsername) setUsername(urlUsername)
    if (urlTheme) setTheme(urlTheme)
    if (urlFontSize) setFontSize(urlFontSize)
    if (urlHideAvatar === 'true') setHideAvatar(true)
    if (urlCardSize) setCardSize(urlCardSize)
  }, [])
  
  // Update URL when settings change
  useEffect(() => {
    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (theme) params.set('theme', theme)
    if (fontSize !== 'normal') params.set('fontSize', fontSize)
    if (hideAvatar) params.set('hideAvatar', 'true')
    if (cardSize !== 'normal') params.set('cardSize', cardSize)
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    window.history.replaceState({}, '', newUrl)
  }, [username, theme, fontSize, hideAvatar, cardSize])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to focus username input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('username')?.focus()
      }
      // Escape to clear error
      if (e.key === 'Escape' && error) {
        setError('')
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [error])

  const generateCardUrl = (user, themeColor, fontSizeOption, hideAvatarOption, cardSizeOption) => {
    const params = new URLSearchParams()
    if (themeColor && themeColor.trim()) {
      params.append('theme', themeColor)
    }
    if (fontSizeOption && fontSizeOption !== 'normal') {
      params.append('fontSize', fontSizeOption)
    }
    if (hideAvatarOption) {
      params.append('hideAvatar', 'true')
    }
    if (cardSizeOption && cardSizeOption !== 'normal') {
      params.append('cardSize', cardSizeOption)
    }
    
    const queryString = params.toString()
    return queryString ? `${API_BASE}/card/${user}?${queryString}` : `${API_BASE}/card/${user}`
  }

  // Validate GitHub username format
  const validateUsername = (username) => {
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

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleGenerate = async () => {
    const validation = validateUsername(username)
    if (!validation.valid) {
      setError(validation.message)
      return
    }

    setLoading(true)
    setImageLoading(true)
    setError('')
    setImageError(false)
    
    try {
      const baseUrl = generateCardUrl(username.trim(), theme, fontSize, hideAvatar, cardSize)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    } catch (err) {
      // Don't expose internal error details
      setError('Failed to generate card. Please check the username and try again.')
      setImageLoading(false)
      setImageError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (e) => {
    const newTheme = e.target.value
    setTheme(newTheme)
    // Regenerate card URL if username exists (card should update immediately)
    if (username.trim()) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      const baseUrl = generateCardUrl(username, newTheme, fontSize, hideAvatar, cardSize)
      // Add timestamp to force browser to reload the image
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const handleFontSizeChange = (e) => {
    const newFontSize = e.target.value
    setFontSize(newFontSize)
    // Regenerate card URL if username exists
    if (username.trim()) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      const baseUrl = generateCardUrl(username, theme, newFontSize, hideAvatar, cardSize)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const handleHideAvatarChange = (e) => {
    const newHideAvatar = e.target.checked
    setHideAvatar(newHideAvatar)
    // Regenerate card URL if username exists
    if (username.trim()) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      const baseUrl = generateCardUrl(username, theme, fontSize, newHideAvatar, cardSize)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const handleCardSizeChange = (e) => {
    const newCardSize = e.target.value
    setCardSize(newCardSize)
    // Regenerate card URL if username exists
    if (username.trim()) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      const baseUrl = generateCardUrl(username, theme, fontSize, hideAvatar, newCardSize)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const shareUrl = () => {
    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (theme) params.set('theme', theme)
    if (fontSize !== 'normal') params.set('fontSize', fontSize)
    if (hideAvatar) params.set('hideAvatar', 'true')
    if (cardSize !== 'normal') params.set('cardSize', cardSize)
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    copyToClipboard(shareUrl)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
    setError('') // Clear any previous errors on successful load
  }

  const handleImageError = async (e) => {
    setImageLoading(false)
    setImageError(true)
    
    // Check if it's a 404 or other HTTP error
    const img = e.target
    if (img && img.src) {
      try {
        const res = await fetch(img.src)
        if (res.status === 404) {
          setError('User not found. Please check the username and try again.')
        } else if (res.status === 403) {
          setError('Rate limit exceeded. Please try again later.')
        } else if (res.status >= 500) {
          setError('Server error. Please try again later.')
        } else {
          // Try to get error message from JSON response
          try {
            const errorData = await res.json()
            setError(errorData.error || 'Failed to load card. Please try again.')
          } catch {
            setError('Failed to load card. Please try again.')
          }
        }
      } catch {
        // Network error or other fetch failure
        setError('Unable to load card. Please check your connection and try again.')
      }
    } else {
      setError('Failed to load card. Please try again.')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied to clipboard!', 'success')
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error')
    }
  }

  const downloadCard = async () => {
    if (!cardUrl) {
      showToast('Please generate a card first', 'error')
      return
    }
    try {
      const response = await fetch(cardUrl)
      const blob = await response.blob()
      
      let finalBlob = blob
      let extension = 'png'
      let mimeType = 'image/png'
      
      // Convert to WebP if selected
      if (exportFormat === 'webp') {
        const canvas = document.createElement('canvas')
        const img = new Image()
        const imgUrl = URL.createObjectURL(blob)
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((webpBlob) => {
              if (webpBlob) {
                finalBlob = webpBlob
                extension = 'webp'
                mimeType = 'image/webp'
                URL.revokeObjectURL(imgUrl)
                resolve()
              } else {
                URL.revokeObjectURL(imgUrl)
                reject(new Error('WebP conversion failed'))
              }
            }, 'image/webp', 0.9)
          }
          img.onerror = () => {
            URL.revokeObjectURL(imgUrl)
            reject(new Error('Image load failed'))
          }
          img.src = imgUrl
        })
      } else if (exportFormat === 'png') {
        extension = 'png'
        mimeType = 'image/png'
      }
      
      const url = window.URL.createObjectURL(finalBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `github-streak-${username || 'card'}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      showToast(`Card downloaded as ${exportFormat.toUpperCase()}!`, 'success')
    } catch (err) {
      // Don't expose internal error details
      showToast('Unable to download card. Please try again.', 'error')
    }
  }

  const copyHtmlCode = () => {
    if (!cardUrl) {
      alert('Please generate a card first')
      return
    }
    const htmlCode = `<img src="${cardUrl}" alt="GitHub Streak Card" />`
    copyToClipboard(htmlCode)
  }

  const copyUrl = () => {
    if (!cardUrl) {
      alert('Please generate a card first')
      return
    }
    const markdownLink = `![GitHub Streak Card](${cardUrl})`
    copyToClipboard(markdownLink)
  }

  return (
    <div className="app">
      <button 
        className={`dark-mode-toggle ${darkMode ? 'active' : ''}`}
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
        role="switch"
        aria-checked={darkMode}
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
        <header>
          <div className="header-title">
            <span className="fire-logo">🔥</span>
            <h1>Github Streak Generator</h1>
          </div>
        </header>

        <div className="main-content">
          <div className="card-and-theme">
            <div className="left-section">
              <div className="input-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
              </div>

              <div className="input-group">
                <label htmlFor="theme">Theme</label>
                <select
                  id="theme"
                  value={theme}
                  onChange={handleThemeChange}
                  className="theme-select"
                >
                  <option value="">Select a theme</option>
                  {themes.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="customization-section">
                <h3 className="customization-title">Card Customization</h3>
                
                <div className="input-group toggle-group">
                  <label htmlFor="hideAvatar" className="toggle-label">Hide Profile Image</label>
                  <button 
                    className={`avatar-toggle ${hideAvatar ? 'active' : ''}`}
                    onClick={() => handleHideAvatarChange({ target: { checked: !hideAvatar } })}
                    aria-label="Toggle profile image"
                    role="switch"
                    aria-checked={hideAvatar}
                    type="button"
                  >
                    <span className="toggle-track">
                      <span className="toggle-handle"></span>
                    </span>
                  </button>
                </div>
                
                <div className="input-group">
                  <label htmlFor="fontSize">Font Size</label>
                  <select
                    id="fontSize"
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="theme-select"
                  >
                    <option value="small">Small</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="cardSize">Card Size</label>
                  <select
                    id="cardSize"
                    value={cardSize}
                    onChange={handleCardSizeChange}
                    className="theme-select"
                  >
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="exportFormat">Export Format</label>
                  <select
                    id="exportFormat"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="theme-select"
                  >
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>

              {error && <div className="error">{error}</div>}

              <button onClick={handleGenerate} disabled={loading} className="submit-button">
                {loading ? 'Generating...' : 'Generate Card'}
              </button>
            </div>

            <div className="card-section">
              {cardUrl ? (
                <>
                  <div className="card-preview">
                    {imageLoading && (
                      <div className="image-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading card...</p>
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
                        alt="GitHub Streak Card"
                        style={{ display: imageLoading ? 'none' : 'block' }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    )}
      </div>
                  {!imageLoading && !imageError && (
                    <div className="action-buttons">
                      <button onClick={copyHtmlCode} className="copy-button">
                        Copy HTML Code
                      </button>
                      <button onClick={copyUrl} className="copy-button">
                        Copy Markdown Link
                      </button>
                      <button onClick={shareUrl} className="copy-button">
                        Share URL
                      </button>
                      <button onClick={downloadCard} className="copy-button download-button">
                        Download ({exportFormat.toUpperCase()})
        </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="placeholder">
                  <div className="preview-container">
                    <img 
                      src={`${API_BASE}/card/octocat?theme=58a6ff`}
                      alt="Preview Card" 
                      className="preview-image"
                    />
                    <p className="preview-note">This is just a preview</p>
                    <p className="preview-instruction">Enter your GitHub username above to see your card</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default App
