import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, BookOpen, Code, Cpu } from 'lucide-react';
import DailyQuestion from './components/DailyQuestion';
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
            <Cpu className="nav-icon" />
            <span>QuantumCode</span>
          </div>
          
          <div className="nav-links">
            <NavLink to="/" className="nav-link">
              <Home size={20} />
              <span>Daily Challenge</span>
            </NavLink>
            <NavLink to="/resources" className="nav-link">
              <BookOpen size={20} />
              <span>Resources</span>
            </NavLink>
            <NavLink to="/problems" className="nav-link">
              <Code size={20} />
              <span>Problems</span>
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DailyQuestion />} />
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
