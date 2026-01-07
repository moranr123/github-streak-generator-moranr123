import { useRef, useEffect } from 'react'
import { STAT_TYPE_OPTIONS } from '../utils/constants'

export function CardGenerator({ 
  username, 
  onUsernameChange, 
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
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [error, inputRefToUse])

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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const generateButton = document.getElementById('generate-button')
              if (generateButton && !generateButton.disabled) {
                generateButton.click()
              }
            }
          }}
          className={!username.trim() ? 'username-empty' : ''}
          aria-required="true"
          aria-invalid={!!error && error.includes('username')}
          aria-describedby={error && error.includes('username') ? 'username-error' : undefined}
          autoComplete="username"
        />
      </div>
    </>
  )
}
