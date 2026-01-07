import { useState, useEffect } from 'react'
import { validateCardWidth, validateCardHeight } from '../utils/validation'
import { STAT_TYPES } from '../utils/constants'

/**
 * Custom hook for card customization state management
 */
export function useCustomization() {
  const [statType, setStatType] = useState(() => {
    const saved = localStorage.getItem('statType')
    return saved || STAT_TYPES.STREAK
  })
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cardTheme')
    return saved || 'ffffff'
  })
  
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('cardFontSize')
    return saved || 'normal'
  })
  
  const [hideAvatar, setHideAvatar] = useState(() => {
    const saved = localStorage.getItem('cardHideAvatar')
    return saved === 'true'
  })
  
  const [cardWidth, setCardWidth] = useState(() => {
    const saved = localStorage.getItem('cardWidth')
    return saved ? parseInt(saved) : 800
  })
  
  const [cardHeight, setCardHeight] = useState(() => {
    const saved = localStorage.getItem('cardHeight')
    return saved ? parseInt(saved) : 400
  })
  
  const [widthError, setWidthError] = useState('')
  const [heightError, setHeightError] = useState('')
  const [exportFormat, setExportFormat] = useState('png')

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('statType', statType)
  }, [statType])

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
    if (typeof cardWidth === 'number') {
      localStorage.setItem('cardWidth', cardWidth.toString())
    }
  }, [cardWidth])

  useEffect(() => {
    if (typeof cardHeight === 'number') {
      localStorage.setItem('cardHeight', cardHeight.toString())
    }
  }, [cardHeight])

  const handleCardWidthChange = (e) => {
    const value = e.target.value
    setWidthError('')
    setCardWidth(value)
    
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        const validation = validateCardWidth(numValue)
        if (!validation.valid) {
          setWidthError(validation.error)
        }
      }
    }
  }

  const handleCardWidthBlur = (e) => {
    const value = e.target.value.trim()
    let newWidth = parseInt(value)
    let error = ''
    
    const currentWidth = typeof cardWidth === 'number' ? cardWidth : (typeof cardWidth === 'string' ? parseInt(cardWidth) : 800)
    
    if (value === '' || isNaN(newWidth) || newWidth < 1) {
      error = 'Please enter a valid width'
      newWidth = 800
    } else {
      const validation = validateCardWidth(newWidth)
      if (!validation.valid) {
        error = validation.error
        newWidth = validation.value // Use validated/clamped value
      }
    }
    
    setWidthError(error)
    setCardWidth(newWidth)
    
    return { newWidth, error, changed: newWidth !== currentWidth }
  }

  const handleCardHeightChange = (e) => {
    const value = e.target.value
    setHeightError('')
    setCardHeight(value)
    
    if (value !== '' && value !== '-') {
      const numValue = parseInt(value)
      if (!isNaN(numValue)) {
        const validation = validateCardHeight(numValue)
        if (!validation.valid) {
          setHeightError(validation.error)
        }
      }
    }
  }

  const handleCardHeightBlur = (e) => {
    const value = e.target.value.trim()
    let newHeight = parseInt(value)
    let error = ''
    
    const currentHeight = typeof cardHeight === 'number' ? cardHeight : (typeof cardHeight === 'string' ? parseInt(cardHeight) : 400)
    
    if (value === '' || isNaN(newHeight) || newHeight < 1) {
      error = 'Please enter a valid height'
      newHeight = 400
    } else {
      const validation = validateCardHeight(newHeight)
      if (!validation.valid) {
        error = validation.error
        newHeight = validation.value // Use validated/clamped value
      }
    }
    
    setHeightError(error)
    setCardHeight(newHeight)
    
    return { newHeight, error, changed: newHeight !== currentHeight }
  }

  return {
    statType,
    theme,
    fontSize,
    hideAvatar,
    cardWidth,
    cardHeight,
    widthError,
    heightError,
    exportFormat,
    setStatType,
    setTheme,
    setFontSize,
    setHideAvatar,
    setExportFormat,
    handleCardWidthChange,
    handleCardWidthBlur,
    handleCardHeightChange,
    handleCardHeightBlur,
    getCustomization: () => ({
      statType,
      theme,
      fontSize,
      hideAvatar,
      cardWidth,
      cardHeight
    })
  }
}
