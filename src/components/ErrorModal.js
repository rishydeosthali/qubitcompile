import React from 'react';
import { RotateCcw } from 'lucide-react';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, problemTitle, output, expectedOutput }) => {

  if (!isOpen) return null;

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-body">
          <h2 className="error-title">Not Quite Right</h2>
          
          <div className="error-details">
            <div className="output-comparison">
              <div className="output-section">
                <h4>Your Output</h4>
                <div className="output-box your-output">
                  {output || 'No output received'}
                </div>
              </div>
              
              <div className="output-section">
                <h4>Expected Output</h4>
                <div className="output-box expected-output">
                  {expectedOutput || 'Check the problem description'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="error-actions">
            <button className="try-again-btn" onClick={onClose}>
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
