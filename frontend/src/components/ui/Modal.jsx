import { useState } from 'react';
import './Modal.css';

/**
 * Reusable Modal — design system §6.8.
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   title     — string
 *   children  — form content
 *   width     — 'sm' | 'md' | 'lg' (default 'md')
 */
export default function Modal({ isOpen, onClose, title, children, width = 'md' }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${width}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
