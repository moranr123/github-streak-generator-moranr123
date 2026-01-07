import { useEffect } from 'react'

export function InstructionsModal({ isOpen, onClose }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">Github stats generator - Instructions</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close instructions modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <section>
            <h3>📖 How to Use</h3>
            <ol>
              <li>Enter your GitHub username in the input field</li>
              <li>Click "Generate Card" or press Enter</li>
              <li>Your contribution streak card will be displayed</li>
              <li>Customize the card using the options below</li>
              <li>Download or share your card!</li>
            </ol>
          </section>

          <section>
            <h3>🎨 Customization Options</h3>
            <ul>
              <li><strong>Theme:</strong> Choose from 9 different color themes</li>
              <li><strong>Font Size:</strong> Small, Normal, or Large</li>
              <li><strong>Hide Avatar:</strong> Toggle profile picture visibility</li>
              <li><strong>Card Dimensions:</strong> Adjust width (400-2000px) and height (200-1200px)</li>
              <li><strong>Export Format:</strong> PNG, WebP, or SVG</li>
            </ul>
          </section>

          <section>
            <h3>⌨️ Keyboard Shortcuts</h3>
            <ul>
              <li><kbd>Ctrl/Cmd + K</kbd> - Focus username input</li>
              <li><kbd>Enter</kbd> - Generate card (when input is focused)</li>
              <li><kbd>Escape</kbd> - Close modal or clear errors</li>
            </ul>
          </section>

          <section>
            <h3>📤 Sharing Your Card</h3>
            <p>After generating your card, you can:</p>
            <ul>
              <li>Copy HTML code to embed in websites</li>
              <li>Copy Markdown link for README files</li>
              <li>Copy shareable URL to share with others</li>
              <li>Download the card in your preferred format</li>
            </ul>
          </section>

          <section>
            <h3>💡 Tips</h3>
            <ul>
              <li>Cards are generated fresh on each request</li>
              <li>Your preferences are saved in your browser</li>
              <li>The card updates automatically when you change customization options</li>
              <li>Works offline - detects when you're disconnected</li>
            </ul>
          </section>

          <section>
            <h3>❓ Troubleshooting</h3>
            <ul>
              <li><strong>User not found:</strong> Check that the username is spelled correctly</li>
              <li><strong>Card not loading:</strong> Check your internet connection</li>
              <li><strong>Server error:</strong> The service may be temporarily unavailable</li>
            </ul>
          </section>
        </div>
        
        <div className="modal-footer">
          <button className="modal-close-button" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
