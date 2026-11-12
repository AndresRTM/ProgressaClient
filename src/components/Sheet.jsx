import { useId, useLayoutEffect, useRef } from 'react'
import Icon from './Icon'

export default function Sheet({ title, children, onClose, className = '', showHandle = false }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      const target =
        opener instanceof HTMLElement && opener.isConnected && !dialog.contains(opener)
          ? opener
          : document.querySelector('[data-dialog-fallback]')
      target?.focus({ preventScroll: true })
    }
  }, [])
  return (
    <dialog
      className={`sheet ${className}`}
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {showHandle && <div className="log-sheet-grip" aria-hidden="true" />}
      <div className="sheet-panel">
        <div className="sheet-heading">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button sheet-close" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
