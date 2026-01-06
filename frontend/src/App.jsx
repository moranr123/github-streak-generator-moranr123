import { useState, useEffect, useRef } from 'react'
import './App.css'
import fireIcon from './assets/fire.png'

function App() {
  const [username, setUsername] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageError, setImageError] = useState(false)
  const [theme, setTheme] = useState('ffffff')
  
  // Animation state
  const [cardLoaded, setCardLoaded] = useState(false)
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
  const [cardWidth, setCardWidth] = useState(800)
  const [cardHeight, setCardHeight] = useState(400)
  const [widthError, setWidthError] = useState('')
  const [heightError, setHeightError] = useState('')
  
  // Export format
  const [exportFormat, setExportFormat] = useState('png')
  
  const themes = [
    { value: 'ffffff', label: 'Default' },
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

  // Clear form on page load/refresh
  useEffect(() => {
    // Clear URL parameters on mount
    window.history.replaceState({}, '', window.location.pathname)
    // Clear card URL to show preview
    setCardUrl('')
    setError('')
    setImageError(false)
    setImageLoading(false)
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    if (theme) localStorage.setItem('cardTheme', theme)
    else localStorage.removeItem('cardTheme')
  }, [theme])

  useEffect(() => {
    localStorage.setItem('cardFontSize', fontSize)
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('cardHideAvatar', hideAvatar.toString())
  }, [hideAvatar])

  useEffect(() => {
    // Only save valid numbers to localStorage
    if (typeof cardWidth === 'number') {
      localStorage.setItem('cardWidth', cardWidth.toString())
    }
  }, [cardWidth])

  useEffect(() => {
    // Only save valid numbers to localStorage
    if (typeof cardHeight === 'number') {
      localStorage.setItem('cardHeight', cardHeight.toString())
    }
  }, [cardHeight])
  
  
  // Update URL when settings change
  useEffect(() => {
    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (theme) params.set('theme', theme)
    if (fontSize !== 'normal') params.set('fontSize', fontSize)
    if (hideAvatar) params.set('hideAvatar', 'true')
    // Only add to URL if they are valid numbers and not default values
    const widthValue = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) : 800)
    const heightValue = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) : 400)
    if (widthValue !== 800 && !isNaN(widthValue)) {
      params.set('cardWidth', widthValue.toString())
    }
    if (heightValue !== 400 && !isNaN(heightValue)) {
      params.set('cardHeight', heightValue.toString())
    }
    
    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    
    window.history.replaceState({}, '', newUrl)
  }, [username, theme, fontSize, hideAvatar, cardWidth, cardHeight])
  
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

  const generateCardUrl = (user, themeColor, fontSizeOption, hideAvatarOption, cardWidthOption, cardHeightOption) => {
    const params = new URLSearchParams()
    // Use theme
    const colorToUse = themeColor ? themeColor.replace('#', '') : ''
    if (colorToUse && colorToUse.trim()) {
      params.append('theme', colorToUse)
    }
    if (fontSizeOption && fontSizeOption !== 'normal') {
      params.append('fontSize', fontSizeOption)
    }
    if (hideAvatarOption) {
      params.append('hideAvatar', 'true')
    }
    // Convert to number if string, then check if not default
    const widthValue = typeof cardWidthOption === 'number' ? cardWidthOption : (typeof cardWidthOption === 'string' ? parseInt(cardWidthOption) : 800)
    const heightValue = typeof cardHeightOption === 'number' ? cardHeightOption : (typeof cardHeightOption === 'string' ? parseInt(cardHeightOption) : 400)
    if (widthValue && !isNaN(widthValue) && widthValue !== 800) {
      params.append('cardWidth', widthValue.toString())
    }
    if (heightValue && !isNaN(heightValue) && heightValue !== 400) {
      params.append('cardHeight', heightValue.toString())
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
    setCardLoaded(false) // Reset animation state
    
    try {
      const baseUrl = generateCardUrl(username.trim(), theme, fontSize, hideAvatar, cardWidth, cardHeight)
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
    setUseCustomColors(false) // Disable custom colors when selecting a theme
    // Regenerate card URL if username exists (card should update immediately)
    if (username.trim()) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      const baseUrl = generateCardUrl(username, newTheme, fontSize, hideAvatar, cardWidth, cardHeight)
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
      const baseUrl = generateCardUrl(username, theme, newFontSize, hideAvatar, cardWidth, cardHeight)
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
      const baseUrl = generateCardUrl(username, theme, fontSize, newHideAvatar, cardWidth, cardHeight)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const handleCardWidthChange = (e) => {
    const value = e.target.value
    // Clear error when user starts typing
    setWidthError('')
    // Allow any input while typing - store as string to allow full editing
    setCardWidth(value)
    
    // Real-time validation while typing (optional - can be removed if too aggressive)
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        if (numValue < 400) {
          setWidthError('Width must be at least 400px')
        } else if (numValue > 2000) {
          setWidthError('Width must be at most 2000px')
        } else {
          setWidthError('')
        }
      }
    }
  }

  const handleCardWidthBlur = (e) => {
    const value = e.target.value.trim()
    let newWidth = parseInt(value)
    let error = ''
    
    // Validate input
    if (value === '' || isNaN(newWidth) || newWidth < 1) {
      error = 'Please enter a valid width'
      newWidth = 800 // Reset to default
    } else if (newWidth < 400) {
      error = 'Width must be at least 400px'
      newWidth = 400 // Clamp to minimum
    } else if (newWidth > 2000) {
      error = 'Width must be at most 2000px'
      newWidth = 2000 // Clamp to maximum
    }
    
    setWidthError(error)
    setCardWidth(newWidth)
    
    // Regenerate card URL if username exists and no error
    if (username.trim() && !error) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      // Get current height value
      const currentHeight = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) || 400 : 400)
      const baseUrl = generateCardUrl(username, theme, fontSize, hideAvatar, newWidth, currentHeight)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const handleCardHeightChange = (e) => {
    const value = e.target.value
    // Clear error when user starts typing
    setHeightError('')
    // Allow any input while typing - store as string to allow full editing
    setCardHeight(value)
    
    // Real-time validation while typing (optional - can be removed if too aggressive)
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        if (numValue < 200) {
          setHeightError('Height must be at least 200px')
        } else if (numValue > 1200) {
          setHeightError('Height must be at most 1200px')
        } else {
          setHeightError('')
        }
      }
    }
  }

  const handleCardHeightBlur = (e) => {
    const value = e.target.value.trim()
    let newHeight = parseInt(value)
    let error = ''
    
    // Validate input
    if (value === '' || isNaN(newHeight) || newHeight < 1) {
      error = 'Please enter a valid height'
      newHeight = 400 // Reset to default
    } else if (newHeight < 200) {
      error = 'Height must be at least 200px'
      newHeight = 200 // Clamp to minimum
    } else if (newHeight > 1200) {
      error = 'Height must be at most 1200px'
      newHeight = 1200 // Clamp to maximum
    }
    
    setHeightError(error)
    setCardHeight(newHeight)
    
    // Regenerate card URL if username exists and no error
    if (username.trim() && !error) {
      setImageLoading(true)
      setImageError(false)
      setError('')
      // Get current width value
      const currentWidth = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) || 800 : 800)
      const baseUrl = generateCardUrl(username, theme, fontSize, hideAvatar, currentWidth, newHeight)
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
  }

  const getShareUrl = () => {
    const params = new URLSearchParams()
    if (username) params.set('username', username)
    if (theme) params.set('theme', theme)
    if (fontSize !== 'normal') params.set('fontSize', fontSize)
    if (hideAvatar) params.set('hideAvatar', 'true')
    const widthValue = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) : 800)
    const heightValue = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) : 400)
    if (widthValue !== 800 && !isNaN(widthValue)) params.set('cardWidth', widthValue.toString())
    if (heightValue !== 400 && !isNaN(heightValue)) params.set('cardHeight', heightValue.toString())
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  const shareUrl = () => {
    const shareUrlText = getShareUrl()
    copyToClipboard(shareUrlText)
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

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
    setError('') // Clear any previous errors on successful load
    setCardLoaded(true) // Trigger animation
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
      } else if (exportFormat === 'svg') {
        // Convert PNG to SVG by embedding as base64
        const canvas = document.createElement('canvas')
        const img = new Image()
        const imgUrl = URL.createObjectURL(blob)
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
            
            // Convert canvas to base64
            const base64 = canvas.toDataURL('image/png')
            
            // Create SVG with embedded image
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${img.width}" height="${img.height}">
              <image width="${img.width}" height="${img.height}" xlink:href="${base64}"/>
            </svg>`
            
            finalBlob = new Blob([svgContent], { type: 'image/svg+xml' })
            extension = 'svg'
            mimeType = 'image/svg+xml'
            URL.revokeObjectURL(imgUrl)
            resolve()
          }
          img.onerror = () => {
            URL.revokeObjectURL(imgUrl)
            reject(new Error('Image load failed'))
          }
          img.src = imgUrl
        })
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
            <img src={fireIcon} alt="Fire" className="fire-logo" />
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
                        placeholder="moranr123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                      />
              </div>

              <div className="customization-section">
                <h3 className="customization-title">Card Customization</h3>
                
                <div className="input-group">
                  <label htmlFor="theme">Theme</label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={handleThemeChange}
                    className="theme-select"
                  >
                    {themes.map((themeOption) => (
                      <option key={themeOption.value} value={themeOption.value}>
                        {themeOption.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                  <label htmlFor="cardWidth">Card Width (px)</label>
                  <input
                    id="cardWidth"
                    type="number"
                    min="400"
                    max="2000"
                    value={cardWidth}
                    onChange={handleCardWidthChange}
                    onBlur={handleCardWidthBlur}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur()
                      }
                    }}
                    className={`theme-select ${widthError ? 'input-error' : ''}`}
                    aria-invalid={!!widthError}
                    aria-describedby={widthError ? 'width-error' : undefined}
                  />
                  {widthError && (
                    <span id="width-error" className="field-error" role="alert">
                      {widthError}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="cardHeight">Card Height (px)</label>
                  <input
                    id="cardHeight"
                    type="number"
                    min="200"
                    max="1200"
                    value={cardHeight}
                    onChange={handleCardHeightChange}
                    onBlur={handleCardHeightBlur}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.target.blur()
                      }
                    }}
                    className={`theme-select ${heightError ? 'input-error' : ''}`}
                    aria-invalid={!!heightError}
                    aria-describedby={heightError ? 'height-error' : undefined}
                  />
                  {heightError && (
                    <span id="height-error" className="field-error" role="alert">
                      {heightError}
                    </span>
                  )}
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
                    <option value="svg">SVG</option>
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
                  <div className="card-preview" style={{ position: 'relative' }}>
                    {imageLoading && (
                      <>
                        <div className="skeleton-loader"></div>
                        <div className="image-loading">
                          <div className="loading-spinner"></div>
                          <p>Loading card...</p>
                        </div>
                      </>
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
                        className={`card-image ${cardLoaded ? 'fade-in' : ''}`}
                        style={{ display: imageLoading ? 'none' : 'block' }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    )}
      </div>
                  {!imageLoading && !imageError && (
                    <div className="action-buttons">
                      <div className="link-section">
                        <label className="link-label">HTML Code</label>
                        <div className="link-item">
                          <code className="link-text">{`<img src="${cardUrl}" alt="GitHub Streak Card" />`}</code>
                          <button onClick={copyHtmlCode} className="copy-icon-button" title="Copy HTML Code">
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
                          <button onClick={copyUrl} className="copy-icon-button" title="Copy Markdown Link">
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
                          <button onClick={shareUrl} className="copy-icon-button" title="Copy Share URL">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button onClick={downloadCard} className="download-button">
                        Download ({exportFormat.toUpperCase()})
        </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="placeholder">
                  <div className="preview-container">
                    <img 
                      src={`${API_BASE}/card/moranr123?theme=ffffff`}
                      alt="Preview Card" 
                      className="preview-image"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.target.style.display = 'none'
                      }}
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
