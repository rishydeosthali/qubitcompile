import React from 'react';
import { CheckCircle } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, problemTitle }) => {

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-body">
          <div className="success-icon-container">
            <CheckCircle className="success-icon" size={80} />
          </div>
          <h2 className="success-title">Problem Completed!</h2>
          
          <div className="success-actions">
            <button className="continue-btn" onClick={onClose}>
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
