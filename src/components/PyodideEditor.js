import React, { useEffect, useState } from "react";

const PyodideEditor = () => {
  const [pyodide, setPyodide] = useState(null);
  const [code, setCode] = useState('print("Hello, Quantum!")');
  const [output, setOutput] = useState("");

  useEffect(() => {
    window.loadPyodide && window.loadPyodide().then(setPyodide);
  }, []);

  const runCode = async () => {
    if (pyodide) {
      try {
        let result = pyodide.runPython(code);
        setOutput(result ? result.toString() : "");
      } catch (err) {
        setOutput(err.toString());
      }
    } else {
      setOutput("Pyodide is still loading...");
    }
  };

  return (
    <div>
      <textarea
        rows={10}
        cols={60}
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <br />
      <button onClick={runCode}>Run</button>
      <pre>{output}</pre>
    </div>
  );
};

// Example usage in App.js
import PyodideEditor from './components/PyodideEditor';

function App() {
  return (
    <div>
      <h1>Python Code Editor</h1>
      <PyodideEditor />
    </div>
  );
}

export default App;