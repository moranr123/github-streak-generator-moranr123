// Theme configurations
export const THEMES = [
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

// Card dimension limits
export const CARD_DIMENSIONS = {
  WIDTH: {
    MIN: 400,
    MAX: 2000,
    DEFAULT: 800
  },
  HEIGHT: {
    MIN: 200,
    MAX: 1200,
    DEFAULT: 400
  }
}

// Font size options
export const FONT_SIZES = {
  SMALL: 'small',
  NORMAL: 'normal',
  LARGE: 'large'
}

// Export formats
export const EXPORT_FORMATS = {
  PNG: 'png',
  WEBP: 'webp',
  SVG: 'svg'
}

// Debounce delay
export const DEBOUNCE_DELAY = 500

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000
}

// Stat types
export const STAT_TYPES = {
  STREAK: 'streak',
  TOP_LANGUAGES: 'top_languages',
  CONTRIBUTIONS: 'contributions',
  REPOSITORIES: 'repositories'
}

export const STAT_TYPE_OPTIONS = [
  { value: STAT_TYPES.STREAK, label: 'Contribution Streak' },
  { value: STAT_TYPES.TOP_LANGUAGES, label: 'Top Languages' },
  { value: STAT_TYPES.CONTRIBUTIONS, label: 'Total Contributions' },
  { value: STAT_TYPES.REPOSITORIES, label: 'Repositories' }
]