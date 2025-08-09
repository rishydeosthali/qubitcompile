import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Calendar, Star } from 'lucide-react';

const DailyQuestion = () => {
  const [code, setCode] = useState(`# Quantum Superposition Simulator
# Today's Challenge: Create a quantum superposition state

from numpy import array, sqrt

def create_superposition():
    """
    Create a quantum superposition state |ψ⟩ = (1/√2)(|0⟩ + |1⟩)
    Return the state vector as a numpy array
    """
    # Your code here
    pass

def measure_probability(state, outcome):
    """
    Calculate the probability of measuring a specific outcome
    state: quantum state vector
    outcome: 0 or 1
    """
    # Your code here
    pass

# Test your implementation
if __name__ == "__main__":
    psi = create_superposition()
    print(f"Superposition state: {psi}")
    print(f"Probability of |0⟩: {measure_probability(psi, 0)}")
    print(f"Probability of |1⟩: {measure_probability(psi, 1)}")
`);

  const [output, setOutput] = useState('');

  const runCode = () => {
    // Simulate code execution
    setOutput(`Running quantum simulation...

Superposition state: [0.70710678 0.70710678]
Probability of |0⟩: 0.5
Probability of |1⟩: 0.5

✓ Perfect! You've successfully created a quantum superposition state.
✓ Both measurement outcomes have equal probability (50% each).
✓ The state vector is properly normalized.

Daily challenge completed! 🎉`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Quantum Challenge</h1>
        <p className="page-subtitle">
          Master quantum computing one problem at a time. Today's challenge focuses on quantum superposition - the fundamental principle that allows qubits to exist in multiple states simultaneously.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Calendar size={24} color="#00d4ff" />
          <div>
            <h2 style={{ color: '#e8e8f0', marginBottom: '0.5rem' }}>January 21, 2025</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="problem-difficulty" style={{ background: 'rgba(78, 205, 196, 0.2)', color: '#4ecdc4' }}>
                EASY
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={16} color="#ffd700" fill="#ffd700" />
                <span style={{ color: '#b0b0c0' }}>Quantum Fundamentals</span>
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1.5rem' }}>
          Quantum Superposition Simulator
        </h3>
        
        <div style={{ color: '#b0b0c0', lineHeight: '1.6', marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Problem:</strong> Create a function that generates a quantum superposition state and calculates measurement probabilities.
          </p>
          
          <p style={{ marginBottom: '1rem' }}>
            In quantum mechanics, a qubit can exist in a superposition of both |0⟩ and |1⟩ states simultaneously. 
            The most common example is the equal superposition state: |ψ⟩ = (1/√2)(|0⟩ + |1⟩)
          </p>

          <p>
            <strong>Your Task:</strong> Implement the <code>create_superposition()</code> and <code>measure_probability()</code> functions 
            to work with quantum states represented as numpy arrays.
          </p>
        </div>

        <div className="editor-container">
          <div className="editor-header">
            <span className="editor-title">Python Code Editor</span>
            <button className="run-button" onClick={runCode}>
              <Play size={16} />
              Run Code
            </button>
          </div>
          <div className="editor-content">
            <Editor
              height="400px"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {output && (
          <div className="output-container">
            <div className="output-header">Output:</div>
            <div className="output-content">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyQuestion; 