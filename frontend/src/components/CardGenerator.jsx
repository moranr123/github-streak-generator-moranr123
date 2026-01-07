import { useRef, useEffect } from 'react'
import { STAT_TYPE_OPTIONS } from '../utils/constants'

export function CardGenerator({ 
  username, 
  onUsernameChange, 
  onGenerate, 
  loading, 
  isOnline,
  error,
  inputRef,
  statType,
  onStatTypeChange
}) {
  const usernameInputRef = useRef(null)
  const inputRefToUse = inputRef || usernameInputRef

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K to focus username input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRefToUse.current?.focus()
      }
      // Escape to clear error
      if (e.key === 'Escape' && error) {
        inputRefToUse.current?.focus()
      }
      // Enter on generate button when focused
      if (e.key === 'Enter' && document.activeElement?.id === 'generate-button') {
        e.preventDefault()
        onGenerate()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [error, username, inputRefToUse, onGenerate])

  return (
    <>
      <div className="input-group">
        <label htmlFor="stat-type">Stat Type</label>
        <select
          id="stat-type"
          value={statType}
          onChange={(e) => onStatTypeChange(e.target.value)}
          className="stat-type-select"
          aria-label="Select stat type"
        >
          {STAT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="username">Username</label>
        <input
          ref={inputRefToUse}
          id="username"
          type="text"
          placeholder="moranr123"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onGenerate()}
          className={!username.trim() ? 'username-empty' : ''}
          aria-required="true"
          aria-invalid={!!error && error.includes('username')}
          aria-describedby={error && error.includes('username') ? 'username-error' : undefined}
          autoComplete="username"
        />
      </div>
      <button 
        id="generate-button"
        onClick={onGenerate} 
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
    </>
  )
}
