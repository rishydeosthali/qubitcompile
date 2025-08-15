import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Play, Star, Clock, Users } from 'lucide-react';
import problemsData from '../data/problems.json';
import solutionsData from '../data/solutions.json';
import { marked } from 'marked';

// Pyodide integration for real Python execution
const PyodideRunner = ({ code, expectedOutput, setOutput }) => {
  const [pyodide, setPyodide] = useState(null);

  useEffect(() => {
    if (!window.loadPyodide) return;
    window.loadPyodide().then(setPyodide);
  }, []);

  const runPython = async () => {
    if (pyodide) {
      try {
        pyodide.runPython(`
import sys
class CapturedOutput:
    def __init__(self):
        self.output = ""
    def write(self, s):
        self.output += s
    def flush(self):
        pass
sys.stdout = CapturedOutput()
`);
        pyodide.runPython(code);
        const pyOutput = pyodide.runPython("sys.stdout.output");
        // Only check if expected output is present
        if (pyOutput && expectedOutput && pyOutput.includes(expectedOutput)) {
          setOutput(
            pyOutput +
              '\n\n✅ Output matches expected result!'
          );
        } else {
          setOutput(
            pyOutput +
              '\n\n❌ Output does not match expected result.'
          );
        }
      } catch (err) {
        setOutput(err.toString() + '\n\n❌ Error executing code.');
      }
    } else {
      setOutput('Pyodide is still loading...');
    }
  };

  return runPython;
};

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentProblem = problemsData[id] || problemsData["1"];
  const currentSolution = solutionsData[id] || "";
  const [code, setCode] = useState(currentProblem.starterCode || '');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  // Extract expected output from description (first line in Example Output)
  let expectedOutput = "";
  if (currentProblem.description) {
    const match = currentProblem.description.match(/Example Output.*?\n\s*• ([^\n<]*)/);
    if (match) expectedOutput = match[1].trim();
  }

  // Pyodide runner function
  const runCode = PyodideRunner({ code, expectedOutput, setOutput });

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
          onMouseEnter={e => {
            e.target.style.background = 'rgba(0, 212, 255, 0.1)';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.3)';
          }}
          onMouseLeave={e => {
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

          <div
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
                style={{
                  whiteSpace: 'pre-line',
                  fontFamily: 'inherit',
                  fontWeight: 400,
                  letterSpacing: '0.01em'
                }}
                dangerouslySetInnerHTML={{
                  __html: currentProblem.description.replace(/\n/g, '<br/>')
                }}
              />
            ) : (
              <>
                <pre style={{
                  background: 'rgba(20, 20, 20, 0.5)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  overflow: 'auto',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  marginBottom: '1rem'
                }}>
                  {currentSolution.solution}
                </pre>
                <div style={{
                  marginTop: '0.5rem',
                  color: '#b0b0c0',
                  fontSize: '0.98rem',
                  background: 'rgba(40,40,40,0.3)',
                  borderRadius: '0.3rem',
                  padding: '0.75rem'
                }}>
                  {currentSolution.explanation}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
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
                color: '#e8e8f0'
              }}>Output:</div>
              <div className="output-content">{output}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;