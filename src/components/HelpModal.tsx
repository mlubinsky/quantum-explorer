import { useEffect } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Physics reference"
      onClick={onClick}
      className="help-btn"
    >?</button>
  )
}

export function HelpModal({ title, onClose, children }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
      >
        <div className="help-modal-header">
          <span className="help-modal-title">{title}</span>
          <button
            type="button"
            className="help-modal-close"
            aria-label="Close"
            onClick={onClose}
          >✕</button>
        </div>
        <div className="help-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
