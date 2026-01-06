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

  const generateCardUrl = (user, themeColor) => {
    const params = new URLSearchParams()
    if (themeColor && themeColor.trim()) {
      params.append('theme', themeColor)
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
      const baseUrl = generateCardUrl(username.trim(), theme)
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
      const baseUrl = generateCardUrl(username, newTheme)
      // Add timestamp to force browser to reload the image
      const url = baseUrl + (baseUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`
      setCardUrl(url)
    }
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
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `github-streak-${username || 'card'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      showToast('Card downloaded successfully!', 'success')
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
                      <button onClick={downloadCard} className="copy-button download-button">
                        Download
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
