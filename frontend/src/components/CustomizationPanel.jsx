import { THEMES, FONT_SIZES, EXPORT_FORMATS, CARD_DIMENSIONS } from '../utils/constants'

export function CustomizationPanel({
  theme,
  fontSize,
  hideAvatar,
  cardWidth,
  cardHeight,
  exportFormat,
  widthError,
  heightError,
  onThemeChange,
  onFontSizeChange,
  onHideAvatarChange,
  onCardWidthChange,
  onCardWidthBlur,
  onCardHeightChange,
  onCardHeightBlur,
  onExportFormatChange
}) {
  return (
    <div className="customization-section">
      <h3 className="customization-title">Card Customization</h3>
      
      <div className="input-group">
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={theme}
          onChange={onThemeChange}
          className="theme-select"
          aria-label="Select card theme color"
        >
          {THEMES.map((themeOption) => (
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
          onClick={() => onHideAvatarChange({ target: { checked: !hideAvatar } })}
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
          onChange={onFontSizeChange}
          className="theme-select"
          aria-label="Select font size for the card"
        >
          <option value={FONT_SIZES.SMALL}>Small</option>
          <option value={FONT_SIZES.NORMAL}>Normal</option>
          <option value={FONT_SIZES.LARGE}>Large</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="cardWidth">Card Width (px)</label>
        <input
          id="cardWidth"
          type="number"
          min={CARD_DIMENSIONS.WIDTH.MIN}
          max={CARD_DIMENSIONS.WIDTH.MAX}
          value={cardWidth}
          onChange={onCardWidthChange}
          onBlur={onCardWidthBlur}
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
          min={CARD_DIMENSIONS.HEIGHT.MIN}
          max={CARD_DIMENSIONS.HEIGHT.MAX}
          value={cardHeight}
          onChange={onCardHeightChange}
          onBlur={onCardHeightBlur}
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
          onChange={onExportFormatChange}
          className="theme-select"
          aria-label="Select export format for downloaded card"
        >
          <option value={EXPORT_FORMATS.PNG}>PNG</option>
          <option value={EXPORT_FORMATS.WEBP}>WebP</option>
          <option value={EXPORT_FORMATS.SVG}>SVG</option>
        </select>
      </div>
    </div>
  )
}
