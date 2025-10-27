import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle, Circle, Star, Clock, Users } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { loadUserProgress, getCompletionCount } from '../utils/progress';
import problemsData from '../data/problems.json';

const Problems = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [user, setUser] = useState(null);
  const [completedProblems, setCompletedProblems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const { completedProblems } = await loadUserProgress(user.uid);
        setCompletedProblems(completedProblems);
      } else {
        setCompletedProblems({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for storage events to update completion status when it changes in other tabs/components
  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === 'userProgress' && user) {
        const { completedProblems } = await loadUserProgress(user.uid);
        setCompletedProblems(completedProblems);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    const handleProgressUpdate = async () => {
      if (user) {
        const { completedProblems } = await loadUserProgress(user.uid);
        setCompletedProblems(completedProblems);
      }
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, [user]);

  const problems = Object.keys(problemsData).map(id => {
    const problem = problemsData[id];
    const descriptionHtml = problem.description || '';
    const match = descriptionHtml.match(/<p>(.*?)<\/p>/);
    const shortDescription = match ? match[1].replace(/<[^>]+>/g, '') : 'No description available.';

    return {
      id,
      ...problem,
      description: shortDescription.substring(0, 100) + (shortDescription.length > 100 ? '...' : ''),
      completed: completedProblems[id] ? true : false,
    };
  });

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
        <h1 className="page-title">LeetCode of Quantum Computing</h1>
        <p className="page-subtitle">
          Challenge yourself with quantum computing problems ranging from basic concepts to advanced algorithms. <b>New problems added weekly!</b>
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
                background: 'rgba(30, 30, 60, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                e.target.style.background = 'rgba(30, 30, 60, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.background = 'rgba(30, 30, 60, 0.8)';
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
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00d4ff' }}>
              {problems.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Total Problems</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ecdc4' }}>
              {getCompletionCount(completedProblems)}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#b0b0c0' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6b6b' }}>
              {problems.length > 0 ? Math.round((getCompletionCount(completedProblems) / problems.length) * 100) : 0}%
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
                  <Circle size={20} color="#4ecdc4" fill="#4ecdc4" />
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
                  <Users size={14} color="#b0b0c0" />
                  <span style={{ fontSize: '0.8rem', color: '#b0b0c0' }}>
                    {problem.submissions}
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