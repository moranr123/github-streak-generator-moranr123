import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [cardUrl, setCardUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [colors, setColors] = useState({
    bg: '0d1117',
    bgGradient: '161b22',
    border: '30363d',
    text: 'f0f6fc',
    accent: '58a6ff',
    currentStreak: 'f0f6fc',
    longestStreak: 'f0f6fc',
    totalCommits: '7c3aed',
    avatarBorder: '58a6ff'
  })

  const API_BASE = 'http://localhost:5000/api/streak'

  const generateCardUrl = (user, colorParams) => {
    const params = new URLSearchParams()
    if (colorParams.bg) params.append('bg', colorParams.bg)
    if (colorParams.bgGradient) params.append('bgGradient', colorParams.bgGradient)
    if (colorParams.border) params.append('border', colorParams.border)
    if (colorParams.text) params.append('text', colorParams.text)
    if (colorParams.accent) params.append('accent', colorParams.accent)
    if (colorParams.currentStreak) params.append('currentStreak', colorParams.currentStreak)
    if (colorParams.longestStreak) params.append('longestStreak', colorParams.longestStreak)
    if (colorParams.totalCommits) params.append('totalCommits', colorParams.totalCommits)
    if (colorParams.avatarBorder) params.append('avatarBorder', colorParams.avatarBorder)
    
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
      const url = generateCardUrl(username, colors)
      setCardUrl(url)
    } catch (err) {
      setError('Failed to generate card. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (key, value) => {
    const newColorValue = value.replace('#', '')
    setColors(prev => {
      const updated = { ...prev, [key]: newColorValue }
      // Regenerate card URL if username exists
      if (username.trim() && cardUrl) {
        setCardUrl(generateCardUrl(username, updated))
      }
      return updated
    })
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
          <h1>GitHub Streak Generator</h1>
          <p>Generate and customize your GitHub contribution streak card</p>
        </header>

        <div className="main-content">
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
              <h3>Customize Colors</h3>
              <div className="color-grid">
                <div className="color-item">
                  <label>Background</label>
                  <input
                    type="color"
                    value={`#${colors.bg}`}
                    onChange={(e) => handleColorChange('bg', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Background Gradient</label>
                  <input
                    type="color"
                    value={`#${colors.bgGradient}`}
                    onChange={(e) => handleColorChange('bgGradient', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Border</label>
                  <input
                    type="color"
                    value={`#${colors.border}`}
                    onChange={(e) => handleColorChange('border', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Text</label>
                  <input
                    type="color"
                    value={`#${colors.text}`}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Accent</label>
                  <input
                    type="color"
                    value={`#${colors.accent}`}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Current Streak</label>
                  <input
                    type="color"
                    value={`#${colors.currentStreak}`}
                    onChange={(e) => handleColorChange('currentStreak', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Longest Streak</label>
                  <input
                    type="color"
                    value={`#${colors.longestStreak}`}
                    onChange={(e) => handleColorChange('longestStreak', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Total Commits</label>
                  <input
                    type="color"
                    value={`#${colors.totalCommits}`}
                    onChange={(e) => handleColorChange('totalCommits', e.target.value)}
                  />
                </div>
                <div className="color-item">
                  <label>Avatar Border</label>
                  <input
                    type="color"
                    value={`#${colors.avatarBorder}`}
                    onChange={(e) => handleColorChange('avatarBorder', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  )
}

export default App
