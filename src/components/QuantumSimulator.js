import React, { useEffect, useRef } from 'react';
import './QuantumSimulator.css';

const QuantumSimulator = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Load local customized version with dark theme
    if (iframeRef.current) {
      iframeRef.current.src = '/quirk/out/quirk.html';
    }
  }, []);

  return (
    <div className="quantum-simulator-container">
      <div className="simulator-header">
        <h1 className="simulator-title">Quantum Circuit Simulator</h1>
      </div>
      <div className="simulator-wrapper">
        <iframe
          ref={iframeRef}
          title="Quantum Circuit Simulator"
          className="quirk-iframe"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  );
};

export default QuantumSimulator;

