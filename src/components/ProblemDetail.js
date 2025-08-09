import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Star, Clock, Users } from 'lucide-react';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  // Mock problem data - in a real app, this would come from an API
  const problems = {
    1: {
      title: "Quantum Superposition State",
      difficulty: "easy",
      category: "Quantum Fundamentals",
      acceptance: "87.3%",
      likes: 142,
      time: "~15 min",
      submissions: "12.4K",
      description: `
## Problem Statement

Create functions to work with quantum superposition states. In quantum mechanics, a qubit can exist in a superposition of both |0⟩ and |1⟩ states simultaneously.

## Background

The most fundamental quantum superposition state is the equal superposition:

**|ψ⟩ = (1/√2)(|0⟩ + |1⟩)**

In this state, measuring the qubit has equal probability (50%) of collapsing to either |0⟩ or |1⟩.

## Tasks

1. **create_superposition()**: Create the equal superposition state as a numpy array
2. **measure_probability(state, outcome)**: Calculate the probability of measuring a specific outcome
3. **normalize_state(state)**: Normalize a quantum state vector

## Example

\`\`\`python
psi = create_superposition()
print(psi)  # [0.70710678 0.70710678]

prob_0 = measure_probability(psi, 0)
print(prob_0)  # 0.5

prob_1 = measure_probability(psi, 1) 
print(prob_1)  # 0.5
\`\`\`

## Constraints

- Use numpy arrays to represent quantum states
- State vectors must be normalized (∑|αᵢ|² = 1)
- Handle edge cases (invalid outcomes, unnormalized states)
      `,
      starterCode: `import numpy as np

def create_superposition():
    """
    Create an equal superposition state |ψ⟩ = (1/√2)(|0⟩ + |1⟩)
    
    Returns:
        np.array: The superposition state vector
    """
    # Your code here
    pass

def measure_probability(state, outcome):
    """
    Calculate the probability of measuring a specific outcome.
    
    Args:
        state (np.array): Quantum state vector
        outcome (int): 0 or 1
        
    Returns:
        float: Probability of measuring the outcome
    """
    # Your code here
    pass

def normalize_state(state):
    """
    Normalize a quantum state vector.
    
    Args:
        state (np.array): Unnormalized state vector
        
    Returns:
        np.array: Normalized state vector
    """
    # Your code here
    pass

# Test your implementation
if __name__ == "__main__":
    # Test superposition creation
    psi = create_superposition()
    print(f"Superposition state: {psi}")
    
    # Test probability calculation
    prob_0 = measure_probability(psi, 0)
    prob_1 = measure_probability(psi, 1)
    print(f"P(|0⟩) = {prob_0}")
    print(f"P(|1⟩) = {prob_1}")
    
    # Test normalization
    unnormalized = np.array([1, 1])
    normalized = normalize_state(unnormalized)
    print(f"Normalized: {normalized}")`,
      solution: `import numpy as np

def create_superposition():
    """
    Create an equal superposition state |ψ⟩ = (1/√2)(|0⟩ + |1⟩)
    
    Returns:
        np.array: The superposition state vector
    """
    return np.array([1/np.sqrt(2), 1/np.sqrt(2)])

def measure_probability(state, outcome):
    """
    Calculate the probability of measuring a specific outcome.
    
    Args:
        state (np.array): Quantum state vector
        outcome (int): 0 or 1
        
    Returns:
        float: Probability of measuring the outcome
    """
    if outcome not in [0, 1]:
        raise ValueError("Outcome must be 0 or 1")
    
    if outcome >= len(state):
        return 0.0
        
    return abs(state[outcome])**2

def normalize_state(state):
    """
    Normalize a quantum state vector.
    
    Args:
        state (np.array): Unnormalized state vector
        
    Returns:
        np.array: Normalized state vector
    """
    norm = np.linalg.norm(state)
    if norm == 0:
        raise ValueError("Cannot normalize zero vector")
    return state / norm`
    },
    2: {
      title: "Bell State Creation",
      difficulty: "easy",
      category: "Quantum Entanglement",
      acceptance: "73.1%",
      likes: 89,
      time: "~20 min",
      submissions: "8.7K",
      description: `
## Problem Statement

Create and analyze Bell states, which are maximally entangled two-qubit quantum states.

## Background

Bell states are the four maximally entangled two-qubit states:
- |Φ⁺⟩ = (1/√2)(|00⟩ + |11⟩)
- |Φ⁻⟩ = (1/√2)(|00⟩ - |11⟩)  
- |Ψ⁺⟩ = (1/√2)(|01⟩ + |10⟩)
- |Ψ⁻⟩ = (1/√2)(|01⟩ - |10⟩)

## Tasks

Implement functions to create and analyze Bell states.
      `,
      starterCode: `import numpy as np

def create_bell_state(state_type="phi_plus"):
    """
    Create one of the four Bell states.
    
    Args:
        state_type (str): "phi_plus", "phi_minus", "psi_plus", or "psi_minus"
        
    Returns:
        np.array: The Bell state vector
    """
    # Your code here
    pass

# Test your implementation
if __name__ == "__main__":
    phi_plus = create_bell_state("phi_plus")
    print(f"Φ⁺: {phi_plus}")`,
      solution: `import numpy as np

def create_bell_state(state_type="phi_plus"):
    """
    Create one of the four Bell states.
    """
    sqrt2 = 1/np.sqrt(2)
    
    if state_type == "phi_plus":
        return np.array([sqrt2, 0, 0, sqrt2])  # |00⟩ + |11⟩
    elif state_type == "phi_minus":  
        return np.array([sqrt2, 0, 0, -sqrt2])  # |00⟩ - |11⟩
    elif state_type == "psi_plus":
        return np.array([0, sqrt2, sqrt2, 0])  # |01⟩ + |10⟩
    elif state_type == "psi_minus":
        return np.array([0, sqrt2, -sqrt2, 0])  # |01⟩ - |10⟩
    else:
        raise ValueError("Invalid state type")`
    }
  };

  const currentProblem = problems[id] || problems[1];

  useState(() => {
    setCode(currentProblem.starterCode);
  }, [id]);

  const runCode = () => {
    // Simulate code execution based on problem
    if (id === "1") {
      setOutput(`Running quantum superposition simulation...

Superposition state: [0.70710678 0.70710678]
P(|0⟩) = 0.5
P(|1⟩) = 0.5
Normalized: [0.70710678 0.70710678]

✓ All tests passed!
✓ Superposition state correctly created
✓ Probabilities sum to 1.0
✓ State vector is normalized

Congratulations! You've mastered quantum superposition! 🎉`);
    } else {
      setOutput(`Running Bell state simulation...

Φ⁺: [0.70710678 0.         0.         0.70710678]

✓ Bell state correctly created!
✓ State is maximally entangled
✓ Vector is properly normalized

Great work on quantum entanglement! 🚀`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4ecdc4';
      case 'medium': return '#ff6b6b';
      case 'hard': return '#ff9f43';
      default: return '#b0b0c0';
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/problems')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#e8e8f0',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 212, 255, 0.1)';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <ArrowLeft size={20} />
          Back to Problems
        </button>
      </div>

      {/* Problem Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: '#e8e8f0',
              marginBottom: '0.5rem'
            }}>
              {currentProblem.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span 
                style={{
                  background: `${getDifficultyColor(currentProblem.difficulty)}20`,
                  color: getDifficultyColor(currentProblem.difficulty),
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                {currentProblem.difficulty}
              </span>
              <span style={{ color: '#00d4ff', fontWeight: '500' }}>
                {currentProblem.category}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={16} color="#ffd700" />
              <span style={{ color: '#b0b0c0' }}>{currentProblem.likes}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#b0b0c0" />
              <span style={{ color: '#b0b0c0' }}>{currentProblem.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="#b0b0c0" />
              <span style={{ color: '#b0b0c0' }}>{currentProblem.submissions}</span>
            </div>
          </div>
        </div>

        {/* Problem Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem',
          padding: '1rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#4ecdc4'
            }}>
              {currentProblem.acceptance}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Acceptance</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#00d4ff'
            }}>
              {currentProblem.submissions}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Submissions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#ff6b6b'
            }}>
              #{id}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Problem ID</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem',
        height: 'calc(100vh - 400px)',
        minHeight: '600px'
      }}>
        {/* Left Panel - Problem Description */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            display: 'flex', 
            gap: '2rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                background: activeTab === 'description' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: activeTab === 'description' ? '#00d4ff' : '#b0b0c0',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              style={{
                background: activeTab === 'solution' ? 'rgba(0, 212, 255, 0.2)' : 'transparent',
                color: activeTab === 'solution' ? '#00d4ff' : '#b0b0c0',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Solution
            </button>
          </div>
          
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            color: '#e8e8f0',
            lineHeight: '1.6'
          }}>
            {activeTab === 'description' ? (
              <div 
                style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{ 
                  __html: currentProblem.description.replace(/\n/g, '<br/>') 
                }}
              />
            ) : (
              <pre style={{ 
                background: 'rgba(20, 20, 20, 0.5)',
                padding: '1rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {currentProblem.solution}
              </pre>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="editor-header">
            <span className="editor-title">Python Code Editor</span>
            <button className="run-button" onClick={runCode}>
              <Play size={16} />
              Run Code
            </button>
          </div>
          
          <div style={{ flex: 1, minHeight: '300px' }}>
            <Editor
              height="100%"
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

          {output && (
            <div className="output-container">
              <div className="output-header">Output:</div>
              <div className="output-content">{output}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 