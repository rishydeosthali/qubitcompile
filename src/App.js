import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { BookOpen, Code, User, LogOut, Trophy } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { loadUserProgress, getCompletionCount } from './utils/progress';
import Resources from './components/Resources';
import Problems from './components/Problems';
import ProblemDetail from './components/ProblemDetail';
import Leaderboard from './components/Leaderboard';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [completedProblems, setCompletedProblems] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const progress = await loadUserProgress(user.uid);
        setCompletedProblems(progress);
      } else {
        setCompletedProblems({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem',
            color: '#b0b0c0'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 212, 255, 0.3)',
              borderTop: '3px solid #00d4ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/favicon2.ico" alt="QubitCompile Logo" className="nav-icon" />
            <span>QubitCompile</span>
          </div>
          
          <div className="nav-links">
            <NavLink to="/problems" className="nav-link">
              <Code size={20} />
              <span>Problems</span>
            </NavLink>
            <NavLink to="/leaderboard" className="nav-link">
              <Trophy size={20} />
              <span>Leaderboard</span>
            </NavLink>
            <NavLink to="/resources" className="nav-link">
              <BookOpen size={20} />
              <span>Resources</span>
            </NavLink>
            
            {user ? (
              <div className="user-menu">

                <div className="user-info">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="Profile" className="user-avatar" />
                  )}
                  <span className="user-name">{user.displayName || user.email}</span>
                </div>
                <button className="sign-out-btn" onClick={handleSignOut}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button className="sign-in-btn" onClick={handleSignIn}>
                <User size={20} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Problems />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
          </Routes>
        </main>

        {/* Authentication Modal */}
        {showAuth && (
          <div className="auth-modal-overlay" onClick={handleCloseAuth}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="auth-modal-close" onClick={handleCloseAuth}>
                ×
              </button>
              <Auth onClose={handleCloseAuth} />
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;