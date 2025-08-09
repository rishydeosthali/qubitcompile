import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle, Circle, Star, Clock } from 'lucide-react';

const Problems = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const problems = [
    {
      id: 1,
      title: "Quantum Superposition State",
      difficulty: "easy",
      category: "Quantum Fundamentals",
      acceptance: "87.3%",
      completed: true,
      description: "Create and manipulate quantum superposition states using numpy arrays.",
      likes: 142,
      time: "~15 min"
    },
    {
      id: 2,
      title: "Bell State Creation",
      difficulty: "easy",
      category: "Quantum Entanglement",
      acceptance: "73.1%",
      completed: false,
      description: "Generate maximally entangled Bell states and measure their properties.",
      likes: 89,
      time: "~20 min"
    },
    {
      id: 3,
      title: "Quantum Circuit Simulator",
      difficulty: "medium",
      category: "Quantum Circuits",
      acceptance: "64.2%",
      completed: false,
      description: "Build a basic quantum circuit simulator with single-qubit gates.",
      likes: 156,
      time: "~45 min"
    },
    {
      id: 4,
      title: "Grover's Search Algorithm",
      difficulty: "medium",
      category: "Quantum Algorithms",
      acceptance: "52.8%",
      completed: false,
      description: "Implement Grover's algorithm for unstructured search problems.",
      likes: 203,
      time: "~60 min"
    },
    {
      id: 5,
      title: "Quantum Fourier Transform",
      difficulty: "hard",
      category: "Quantum Algorithms",
      acceptance: "38.5%",
      completed: false,
      description: "Implement the Quantum Fourier Transform for period finding.",
      likes: 178,
      time: "~90 min"
    },
    {
      id: 6,
      title: "Variational Quantum Eigensolver",
      difficulty: "hard",
      category: "Quantum Chemistry",
      acceptance: "31.2%",
      completed: false,
      description: "Use VQE to find ground state energies of molecular systems.",
      likes: 134,
      time: "~120 min"
    },
    {
      id: 7,
      title: "Quantum Error Correction",
      difficulty: "hard",
      category: "Error Correction",
      acceptance: "29.6%",
      completed: false,
      description: "Implement basic quantum error correction codes.",
      likes: 95,
      time: "~105 min"
    },
    {
      id: 8,
      title: "Quantum Teleportation Protocol",
      difficulty: "medium",
      category: "Quantum Communication",
      acceptance: "56.7%",
      completed: false,
      description: "Simulate the quantum teleportation protocol step by step.",
      likes: 167,
      time: "~50 min"
    },
    {
      id: 9,
      title: "Shor's Factoring Algorithm",
      difficulty: "hard",
      category: "Quantum Algorithms",
      acceptance: "22.4%",
      completed: false,
      description: "Implement Shor's algorithm for integer factorization.",
      likes: 245,
      time: "~150 min"
    },
    {
      id: 10,
      title: "Quantum Walk Implementation",
      difficulty: "medium",
      category: "Quantum Algorithms",
      acceptance: "47.3%",
      completed: false,
      description: "Simulate discrete and continuous quantum random walks.",
      likes: 112,
      time: "~70 min"
    }
  ];

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4ecdc4';
      case 'medium': return '#ff6b6b';
      case 'hard': return '#ff9f43';
      default: return '#b0b0c0';
    }
  };

  const handleProblemClick = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quantum Problems</h1>
        <p className="page-subtitle">
          Challenge yourself with quantum computing problems ranging from basic concepts to advanced algorithms. 
          Master the fundamentals and build towards quantum advantage.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            flex: '1',
            minWidth: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Search size={20} color="#b0b0c0" />
            <input
              type="text"
              placeholder="Search problems or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e8e8f0',
                fontSize: '1rem',
                flex: 1
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} color="#b0b0c0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                color: '#e8e8f0',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          marginTop: '1.5rem',
          padding: '1rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ecdc4' }}>
              {problems.filter(p => p.completed).length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Solved</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {problems.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Total</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {Math.round((problems.filter(p => p.completed).length / problems.length) * 100)}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Progress</div>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="problems-grid">
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            className={`card problem-card difficulty-${problem.difficulty}`}
            onClick={() => handleProblemClick(problem.id)}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {problem.completed ? (
                  <CheckCircle size={20} color="#4ecdc4" fill="#4ecdc4" />
                ) : (
                  <Circle size={20} color="#666" />
                )}
                <span style={{ 
                  fontSize: '0.9rem', 
                  color: '#b0b0c0',
                  fontWeight: '500'
                }}>
                  #{problem.id}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={14} color="#ffd700" />
                  <span style={{ fontSize: '0.8rem', color: '#b0b0c0' }}>
                    {problem.likes}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} color="#b0b0c0" />
                  <span style={{ fontSize: '0.8rem', color: '#b0b0c0' }}>
                    {problem.time}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="problem-title">{problem.title}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <span 
                className="problem-difficulty"
                style={{
                  background: `${getDifficultyColor(problem.difficulty)}20`,
                  color: getDifficultyColor(problem.difficulty)
                }}
              >
                {problem.difficulty}
              </span>
            </div>

            <p className="problem-description">{problem.description}</p>

            <div className="problem-stats">
              <span style={{ 
                color: '#00d4ff',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                {problem.category}
              </span>
              <span style={{ 
                color: problem.acceptance > 50 ? '#4ecdc4' : '#ff6b6b'
              }}>
                {problem.acceptance} acceptance
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#b0b0c0', marginBottom: '1rem' }}>
            No problems found matching your criteria
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDifficulty('all');
            }}
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Problems; 