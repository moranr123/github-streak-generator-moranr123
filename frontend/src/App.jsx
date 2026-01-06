import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState('')
  
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

  const API_BASE = 'http://localhost:5000/api/streak'

  const generateCardUrl = (user, themeColor) => {
    const params = new URLSearchParams()
    if (themeColor && themeColor.trim()) {
      params.append('theme', themeColor)
    }
    
    const queryString = params.toString()
    return queryString ? `${API_BASE}/card/${user}?${queryString}` : `${API_BASE}/card/${user}`
  }

  const handleGenerate = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const url = generateCardUrl(username, theme)
      setCardUrl(url)
    } catch (err) {
      setError('Failed to generate card. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (value) => {
    const newTheme = value.replace('#', '')
    setTheme(newTheme)
    // Regenerate card URL if username exists
    if (username.trim() && cardUrl) {
      setCardUrl(generateCardUrl(username, newTheme))
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
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
    copyToClipboard(cardUrl)
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <div className="header-title">
            <img 
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
              alt="GitHub" 
              className="github-logo"
            />
            <h1>Streak Generator</h1>
          </div>
        </header>

        <div className="main-content">
          <div className="card-section">
            {cardUrl ? (
              <>
                <div className="card-preview">
                  <img src={cardUrl} alt="GitHub Streak Card" />
                </div>
                <div className="action-buttons">
                  <button onClick={copyHtmlCode} className="copy-button">
                    Copy HTML Code
                  </button>
                  <button onClick={copyUrl} className="copy-button">
                    Copy URL
                  </button>
                </div>
              </>
            ) : (
              <div className="placeholder">
                <p>Enter a username and click "Generate Card" to see your streak card</p>
              </div>
            )}
          </div>

          <div className="input-section">
            <div className="input-group">
              <label htmlFor="username">GitHub Username</label>
              <div className="input-with-button">
                <input
                  id="username"
                  type="text"
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button onClick={handleGenerate} disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Card'}
                </button>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="color-customization">
              <div className="color-item">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
