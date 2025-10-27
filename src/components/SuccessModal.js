import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Zap } from 'lucide-react';
import './SuccessModal.css';

const SuccessModal = ({ isOpen, onClose, problemTitle }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after modal opens
      setTimeout(() => setShowAnimation(true), 100);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`success-modal-body ${showAnimation ? 'animate' : ''}`}>
          <div className="success-icon-container">
            <CheckCircle className="success-icon" size={80} />
            <div className="success-ring"></div>
          </div>
          
          <h2 className="success-title">Problem Completed!</h2>

          
          <div className="success-stats">

            <div className="stat-item">
              <Zap className="stat-icon" size={24} />
              <span>Quantum Mastery</span>
            </div>
          </div>
          
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
