import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState('58a6ff')

  const API_BASE = 'http://localhost:5000/api/streak'

  const generateCardUrl = (user, themeColor) => {
    const params = new URLSearchParams()
    if (themeColor) params.append('theme', themeColor)
    
    return `${API_BASE}/card/${user}?${params.toString()}`
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
            <span className="github-label">GitHub</span>
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
                <input
                  id="theme"
                  type="color"
                  value={`#${theme}`}
                  onChange={(e) => handleThemeChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
