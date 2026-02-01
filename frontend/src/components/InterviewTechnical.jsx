import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/InterviewTechnical.css';

import Mic from '../svg/mic';
import Micw from '../svg/micw';

function InterviewTechnical() {
  const navigate = useNavigate();
  const location = useLocation();
  const { company, difficulty } = location.state || {
    company: 'General',
    difficulty: 'Medium',
  };

  const videoRef = useRef(null);

  const [code, setCode] = useState(`// Write your solution here

function solution(nums, target) {
  // your code
}
`);
  const [language, setLanguage] = useState('JavaScript');
  const [output, setOutput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRecording = () => {
    if (isLoading) return;
    setIsRecording((prev) => !prev);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});
  }, []);

  const handleRun = () => {
    if (language !== 'JavaScript') {
      setOutput('❌ Only JavaScript is supported.');
      return;
    }

    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) =>
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));

    console.error = (...args) =>
      logs.push('❌ ' + args.map(a => String(a)).join(' '));

    try {
      const fn = new Function(`
        ${code}
        if (typeof solution === 'function') return solution;
      `);

      const solutionFn = fn();
      if (typeof solutionFn === 'function') {
        solutionFn([2,7,11,15], 9);
      } else {
        logs.push('⚠️ solution() not found');
      }
    } catch (err) {
      logs.push('❌ Error: ' + err.message);
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }

    setOutput(logs.join('\n'));
  };

  return (
    <div className="tech-container leetcode-theme">
      {/* Header */}
      <header className="tech-header">
        <div className="header-left">
          <button className="exit-btn" onClick={() => navigate('/home')}>
            ← Exit
          </button>
          <span className="interview-meta">
            {company} • Technical • {difficulty}
          </span>
        </div>
        <div className="header-right">
          <button className="run-btn" onClick={handleRun}>▶ Run</button>
          <button className="submit-btn">Submit</button>
        </div>
      </header>

      {/* Workspace */}
      <div className="tech-workspace">
        {/* LEFT: Problem */}
        <div className="panel left-panel">
          <div className="tabs">
            <span className="active">Description</span>
            <span>Editorial</span>
            <span>Solutions</span>
            <span>Submissions</span>
          </div>

          <div className="problem-content">
            <h2>1. Two Sum</h2>
            <span className={`difficulty-tag ${difficulty.toLowerCase()}`}>
              {difficulty}
            </span>

            <p>
              Given an array of integers <code>nums</code> and an integer{' '}
              <code>target</code>, return indices of the two numbers such that
              they add up to <code>target</code>.
            </p>

            <pre className="example-box">
nums = [2,7,11,15]
target = 9
Output: [0,1]
            </pre>
          </div>
        </div>

        {/* RIGHT: Editor + Bottom Section */}
        <div className="panel right-panel">
          <div className="editor-header">
            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>JavaScript</option>
              <option disabled>Python</option>
              <option disabled>Java</option>
              <option disabled>C++</option>
            </select>
          </div>

          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />

          {/* Bottom Split Area */}
          <div className="bottom-row">
            {/* Mini Menu */}
            <div className="mini-menu">
              <button
                className={`mic-button ${isRecording ? 'active' : ''}`}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? <Micw size={18} /> : <Mic size={18} />}
              </button>
            </div>

            {/* Testcases */}
            <div className="testcase-panel">
              <div className="panel-header small">Testcases</div>
              <pre className="testcase-content">
Input:
nums = [2,7,11,15]
target = 9

Expected Output:
[0,1]
              </pre>
            </div>
          </div>

          {/* Console */}
          <div className="console-area">
            <div className="panel-header small">Testcase Output</div>
            <pre className="console-output">
              {output || '// Run your code to see output'}
            </pre>
          </div>
        </div>
      </div>

      {/* Camera */}
      <div className="floating-camera">
        <video ref={videoRef} autoPlay playsInline muted />
        <div className="cam-label">You</div>
      </div>
    </div>
  );
}

export default InterviewTechnical;
