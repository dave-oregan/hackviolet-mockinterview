import React from 'react';
import '../css/Home.css';

function SelectMode({ open, onClose, onSelect }) {
  if (!open) return null;

  const handleSelect = (mode) => {
    if (onSelect) onSelect(mode);
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h3 className="modal-title">Choose interview type</h3>
        <div className="modal-options">
          <button className="modal-option" onClick={() => handleSelect('behavioral')}>
            Behavioral Interview
          </button>
          <button className="modal-option" onClick={() => handleSelect('technical')}>
            Technical Interview
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectMode;
