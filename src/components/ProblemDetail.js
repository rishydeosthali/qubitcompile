import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, ArrowRight, Play, Star, Clock, Users } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserProgress, loadUserProgress, markSolutionAsViewed } from '../utils/progress';
import problemsData from '../data/problems.json';
import solutionsData from '../data/solutions.json';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentProblem = problemsData[id] || problemsData["1"];

  // Navigation logic
  const problemIds = Object.keys(problemsData);
  const currentProblemIndex = problemIds.indexOf(id);
  const prevProblemId = currentProblemIndex > 0 ? problemIds[currentProblemIndex - 1] : null;
  const nextProblemId = currentProblemIndex < problemIds.length - 1 ? problemIds[currentProblemIndex + 1] : null;

  const [code, setCode] = useState(currentProblem.starterCode || '');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [likes, setLikes] = useState(currentProblem.likes);
  const [isStarred, setIsStarred] = useState(false);
  const [user, setUser] = useState(null);
  const [completedProblems, setCompletedProblems] = useState({});
  const [viewedSolutions, setViewedSolutions] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [lastOutput, setLastOutput] = useState('');
  const [submissions, setSubmissions] = useState(currentProblem.submissions);
  const [showSolution, setShowSolution] = useState(false);
  const [showSolutionConfirmation, setShowSolutionConfirmation] = useState(false);

  const parseSubmissions = (subs) => {
    if (typeof subs === 'string' && subs.toUpperCase().endsWith('K')) {
      return parseFloat(subs) * 1000;
    }
    return parseInt(subs, 10);
  };

  const formatSubmissions = (subs) => {
    if (subs >= 10000) {
      return (subs / 1000).toFixed(1) + 'K';
    }
    return subs.toString();
  };

  const handleShowSolution = () => {
    setShowSolutionConfirmation(true);
  };

  const handleConfirmSolution = () => {
    if (user) {
      markSolutionAsViewed(user.uid, id);
      setViewedSolutions(prev => ({ ...prev, [id]: true })); // Update local state
    }
    setShowSolution(true);
    setShowSolutionConfirmation(false);
  };

  const handleCancelSolution = () => {
    setShowSolutionConfirmation(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const { completedProblems, viewedSolutions } = await loadUserProgress(user.uid);
        setCompletedProblems(completedProblems);
        setViewedSolutions(viewedSolutions);
        if (completedProblems[id]?.completedAt) {
          setShowSolution(true);
        }
      } else {
        setCompletedProblems({});
        setViewedSolutions({});
      }
    });

    return () => unsubscribe();
  }, [id]);

  // Update completion status when user changes or when we complete a problem
  useEffect(() => {
    if (user && completedProblems[id]) {
      // Force a re-render to ensure the completion status is visible
      const timer = setTimeout(() => {
        setCompletedProblems(prev => ({ ...prev }));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, completedProblems, id]);

  useEffect(() => {
    const newProblem = problemsData[id] || problemsData["1"];
    setCode(newProblem.starterCode || '');
    setOutput('');
    setShowSolution(false); // Reset solution visibility
    setSubmissions(newProblem.submissions);
  }, [id]);

  useEffect(() => {
    const body = document.body;
    if (showSuccessModal || showErrorModal) {
      body.classList.add('modal-open');
    } else {
      body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      body.classList.remove('modal-open');
    };
  }, [showSuccessModal, showErrorModal]);

  const handleStarClick = () => {
    if (isStarred) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsStarred(!isStarred);
  };



  const checkCompletion = (output) => {
    const { expectedOutput } = currentProblem;

    const normalizeStrings = (str) => {
      if (str === null || str === undefined) {
        return '';
      }
      return str.toString().replace(/\s/g, '');
    };

    const normalizeForThreshold = (str) => {
      if (str === null || str === undefined) {
        return '';
      }
      return str.toString().trim().replace(/\s+/g, ' ');
    };

    if (output === null || output === undefined) {
      return false;
    }

    // Version 1: Simple String Match
    if (typeof expectedOutput === 'string') {
      return normalizeStrings(output) === normalizeStrings(expectedOutput);
    }

    // Version 2: Multiple Acceptable Outputs (modified to handle array of objects for thresholds)
    if (Array.isArray(expectedOutput)) {
      // Check if it's an array of threshold objects
      const isThresholdArray = expectedOutput.every(e => typeof e === 'object' && e !== null && e.operator && e.value !== undefined && e.description !== undefined);

      if (isThresholdArray) {
        // All conditions in the array must be met
        return expectedOutput.every(expectedItem => {
          const { operator, value, description } = expectedItem;

          // Find the line in the output that matches the description
          const outputLines = output.split('\n').map(line => normalizeForThreshold(line));
          
          let matchedOutputValue = null;

          for (const line of outputLines) {
            if (line.startsWith(normalizeForThreshold(description))) {
              const outputMatches = line.match(/([\d\.-]+)$/);
              if (outputMatches) {
                matchedOutputValue = parseFloat(outputMatches[0]);
                break;
              }
            }
          }

          if (matchedOutputValue === null) return false; // Description not found or value not extracted

          switch (operator) {
            case '>': return matchedOutputValue > value;
            case '<': return matchedOutputValue < value;
            case '>=': return matchedOutputValue >= value;
            case '<=': return matchedOutputValue <= value;
            case '==': return matchedOutputValue === value;
            case '~': return Math.abs(matchedOutputValue - value) < 0.1; // For "around" comparison
            default: return false;
          }
        });
      } else {
        // Original logic for multiple acceptable string outputs
        const normalizedOutput = normalizeStrings(output);
        return expectedOutput.some(e => normalizeStrings(e) === normalizedOutput);
      }
    }

    // Version 3: Threshold Comparison
    if (typeof expectedOutput === 'object' && expectedOutput !== null && !Array.isArray(expectedOutput)) {
      const normalizedOutput = normalizeForThreshold(output);
      const { operator, value, description } = expectedOutput;

      const outputMatches = normalizedOutput.match(/([\d\.-]+)$/);
      if (!outputMatches) return false;
      const outputValue = parseFloat(outputMatches[0]);

      const outputText = normalizedOutput.replace(/([\d\.-]+)$/, '').trim();
      const descriptionText = normalizeForThreshold(description).replace(/[<>=]+\s*[\d\.]+$/, '').trim();
      
      if (outputText !== descriptionText) {
        if (!outputText.endsWith(descriptionText)) {
          return false;
        }
      }

      switch (operator) {
        case '>': return outputValue > value;
        case '<': return outputValue < value;
        case '>=': return outputValue >= value;
        case '<=': return outputValue <= value;
        case '==': return outputValue === value;
        default: return false;
      }
    }

    // Fallback
    const normalizedOutput = normalizeForThreshold(output);
    const normalizedExpected = normalizeForThreshold(expectedOutput.toString());
    return normalizedOutput === normalizedExpected;
  };

  const extractExpectedOutputFromDescription = (problemDescription) => {
    try {
      const marker = '<strong>Expected Output:</strong><br/>';
      const startIndex = problemDescription.indexOf(marker);

      if (startIndex !== -1) {
        const fromMarker = problemDescription.substring(startIndex + marker.length);
        const endIndex = fromMarker.indexOf('</div>');
        let rawOutput = (endIndex !== -1) ? fromMarker.substring(0, endIndex) : fromMarker;
        
        const withNewlines = rawOutput.replace(/<br\s*\/?>/gi, ' ');
        const noTags = withNewlines.replace(/<[^>]+>/g, '');
        
        const cleaned = noTags
          .split('\n')
          .map(line => line.trim())
          .join(' ')

        return cleaned.trim();
      }
      
      return "Check the problem description for expected output";
    } catch (error) {
      console.error('Error extracting expected output:', error);
      return "Check the problem description for expected output";
    }
  };

  // Function to get expected output for display
  const getExpectedOutput = (problemId) => {
    const problem = problemsData[problemId];
    if (!problem) return "Check the problem description for expected output";
    
    return extractExpectedOutputFromDescription(problem.description);
  };

  const cancelExecution = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setOutput('Execution cancelled by user.');
    }
  };

  const runCode = async () => {
    // TODO: Increment submission count for the problem in the backend
    const currentSubmissions = parseSubmissions(submissions);
    setSubmissions(formatSubmissions(currentSubmissions + 1));
    setIsLoading(true);
    setOutput('Starting Python execution...');

    let messageInterval;
    
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      setAbortController(controller);
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Update loading message periodically
      const loadingMessages = [
        'Starting Python execution...',
        'Loading Qiskit libraries...',
        'Setting up quantum simulator...',
        'Running your quantum circuit...',
        'Processing results...'
      ];
      
      let messageIndex = 0;
      messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length - 1) {
          messageIndex++;
          setOutput(loadingMessages[messageIndex]);
        }
      }, 2000);

      const response = await fetch('https://quantum-app-backend-244541317596.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(messageInterval);
      setAbortController(null);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.text();
      setOutput(result);
      setLastOutput(result);

      if (checkCompletion(result)) {
        setShowSuccessModal(true);

        if (user && !completedProblems[id]?.completedAt && !viewedSolutions[id]) {
          // Update local state immediately for instant UI feedback
          setCompletedProblems(prev => ({
            ...prev,
            [id]: { completedAt: new Date(), solution: code }
          }));
          
          // Save progress to Firebase in the background (don't await)
          saveUserProgress(user.uid, id, code).then(() => {
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('progressUpdated'));
          }).catch(error => {
            console.error('Failed to save progress:', error);
          });
        }
      } else {
        // Show error modal for incorrect output
        setShowErrorModal(true);
      }

    } catch (error) {
      if (messageInterval) clearInterval(messageInterval);
      setAbortController(null);
      
      if (error.name === 'AbortError') {
        setOutput('Execution timed out after 30 seconds. Please try again with simpler code or check your internet connection.');
      } else if (error.message.includes('fetch')) {
        setOutput('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setOutput(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/problems')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1))',
            border: '2px solid rgba(0, 212, 255, 0.3)',
            color: '#00d4ff',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(0, 212, 255, 0.1)'
          }}
          onMouseEnter={e => {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(78, 205, 196, 0.2))';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.2)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(78, 205, 196, 0.1))';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.1)';
          }}
        >
          <ArrowLeft size={20} />
          Back to Problems
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => navigate(`/problems/${prevProblemId}`)}
            disabled={!prevProblemId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: !prevProblemId 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(0, 212, 255, 0.1))',
              border: !prevProblemId 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '2px solid rgba(78, 205, 196, 0.3)',
              color: !prevProblemId ? '#8a8a9a' : '#4ecdc4',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              cursor: !prevProblemId ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              fontSize: '1rem',
              opacity: !prevProblemId ? 0.5 : 1,
              boxShadow: !prevProblemId ? 'none' : '0 4px 15px rgba(78, 205, 196, 0.1)'
            }}
            onMouseEnter={e => {
              if (prevProblemId) {
                e.target.style.background = 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(0, 212, 255, 0.2))';
                e.target.style.borderColor = 'rgba(78, 205, 196, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.2)';
              }
            }}
            onMouseLeave={e => {
              if (prevProblemId) {
                e.target.style.background = 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(0, 212, 255, 0.1))';
                e.target.style.borderColor = 'rgba(78, 205, 196, 0.3)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.1)';
              }
            }}
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          <button
            onClick={() => navigate(`/problems/${nextProblemId}`)}
            disabled={!nextProblemId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: !nextProblemId 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 159, 67, 0.1))',
              border: !nextProblemId 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '2px solid rgba(255, 107, 107, 0.3)',
              color: !nextProblemId ? '#8a8a9a' : '#ff6b6b',
              padding: '1rem 1.5rem',
              borderRadius: '0.75rem',
              cursor: !nextProblemId ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              fontSize: '1rem',
              opacity: !nextProblemId ? 0.5 : 1,
              boxShadow: !nextProblemId ? 'none' : '0 4px 15px rgba(255, 107, 107, 0.1)'
            }}
            onMouseEnter={e => {
              if (nextProblemId) {
                e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 159, 67, 0.2))';
                e.target.style.borderColor = 'rgba(255, 107, 107, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.2)';
              }
            }}
            onMouseLeave={e => {
              if (nextProblemId) {
                e.target.style.background = 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 159, 67, 0.1))';
                e.target.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.1)';
              }
            }}
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

        {/* Problem Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          {viewedSolutions[id] && !completedProblems[id]?.completedAt && (
            <div style={{
              background: 'rgba(255, 159, 67, 0.2)',
              color: '#ff9f43',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 159, 67, 0.3)'
            }}>
              You have viewed the solution for this problem, so it cannot be marked as completed
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#e8e8f0',
                  margin: 0
                }}>
                  {currentProblem.title}
                </h1>
                {completedProblems[id]?.completedAt && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(78, 205, 196, 0.2)',
                    color: '#4ecdc4',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    ✓ Completed
                  </div>
                )}
              </div>
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
              <Clock size={16} color="#b0b0c0" />
              <span style={{ color: '#b0b0c0' }}>{currentProblem.time}</span>
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
              {submissions}
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
        gap: '2rem'
      }}>
        {/* Left Panel - Problem Description */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
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

          <div
            className="left-panel-content"
            style={{
              flex: 1,
              overflow: 'auto',
              color: '#e8e8f0',
              lineHeight: '1.7',
              fontSize: '1.05rem',
              background: 'rgba(30, 32, 40, 0.7)',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              padding: '2rem 2rem 1.5rem 2rem',
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            {activeTab === 'description' ? (
              <div
                className="problem-content"
                dangerouslySetInnerHTML={{
                  __html: currentProblem.description
                }}
              />
            ) : (
              user ? (
                (completedProblems[id]?.completedAt || viewedSolutions[id] || showSolution) ? (
                  <div className="solution-code-container">
                    <div className="solution-code-header">
                      <span>Python Solution</span>
                    </div>
                    <pre className="solution-code">
                      {solutionsData[id]?.solution}
                    </pre>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h3 style={{ 
                      color: '#e8e8f0', 
                      marginBottom: '1rem',
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      letterSpacing: '0.01em'
                    }}>View Solution</h3>
                    <p style={{
                      color: '#ff6b6b',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                      maxWidth: '100%',
                      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontWeight: '500',
                      lineHeight: '1.5',
                      background: 'rgba(255, 107, 107, 0.05)',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255, 107, 107, 0.1)'
                    }}>
                      ⚠️ This will prevent you from receiving credit for this problem
                    </p>
                    <button 
                      onClick={handleShowSolution}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#e8e8f0',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.01em'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      Show Solution
                    </button>
                  </div>
                )
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  padding: '3rem 2rem',
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 107, 107, 0.05))',
                  borderRadius: '1rem',
                  border: '2px dashed rgba(0, 212, 255, 0.3)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)'
                  }}>
                    <div style={{ fontSize: '2.5rem' }}>🔒</div>
                  </div>
                  <h3 style={{ 
                    color: '#e8e8f0', 
                    marginBottom: '2rem',
                    fontSize: '1.5rem',
                    fontWeight: '600'
                  }}>Sign In to View Solutions</h3>
                  <button 
                    onClick={() => {
                      // Trigger sign in modal by dispatching a custom event
                      window.dispatchEvent(new CustomEvent('showAuthModal'));
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
                    }}
                  >
                    Sign In to Continue
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <div className="editor-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <span className="editor-title" style={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#e8e8f0'
            }}>Python Code Editor</span>
            {isLoading ? (
              <button className="run-button" onClick={cancelExecution} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '0.5rem 1.5rem'
              }}>
                <span>✕</span>
                Cancel
              </button>
            ) : (
              <button className="run-button" onClick={runCode} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#4f8cff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '0.5rem 1.5rem'
              }}>
                <Play size={16} />
                Run Code
              </button>
            )}
          </div>

          <div style={{ flex: 1, minHeight: '300px', overflow: 'hidden' }}>
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

          {(output || isLoading) && (
            <div className="output-container" style={{
              marginTop: '1rem',
              background: '#181818',
              padding: '1rem',
              borderRadius: '4px',
              color: '#baffc9',
              fontFamily: 'monospace',
              fontSize: '1rem',
              whiteSpace: 'pre-wrap'
            }}>
              <div className="output-header" style={{
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#e8e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {isLoading && (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(0, 212, 255, 0.3)',
                    borderTop: '2px solid #00d4ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                )}
                {isLoading ? 'Executing...' : 'Output:'}
              </div>
              <div className="output-content">{output}</div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        problemTitle={currentProblem.title}
      />

      {/* Error Modal */}
      <ErrorModal 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        problemTitle={currentProblem.title}
        output={lastOutput}
        expectedOutput={getExpectedOutput(id)}
      />

      {/* Solution Confirmation Modal */}
      {showSolutionConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(30, 30, 60, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              color: '#e8e8f0',
              marginBottom: '1rem',
              fontSize: '1.25rem',
              fontWeight: '600',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              letterSpacing: '0.01em'
            }}>
              Are you sure?
            </h2>
            
            <p style={{
              color: '#b0b0c0',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontWeight: '400'
            }}>
              This will prevent you from receiving credit for this problem
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCancelSolution}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e8e8f0',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmSolution}
                style={{
                  background: 'rgba(255, 107, 107, 0.8)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 0.8)';
                }}
              >
                Show Solution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDetail;