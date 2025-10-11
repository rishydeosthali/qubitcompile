import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { BookOpen, Code } from 'lucide-react';
import Resources from './components/Resources';
import Problems from './components/Problems';
import ProblemDetail from './components/ProblemDetail';
import './App.css';

function App() {
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
            <NavLink to="/resources" className="nav-link">
              <BookOpen size={20} />
              <span>Resources</span>
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Problems />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;