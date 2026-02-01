import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ColorBends from './ColorBends';
import '../css/InterviewTechnical.css';

function InterviewTechnical() {
  const navigate = useNavigate();
  const location = useLocation();
  const { company, difficulty } = location.state || { company: 'General', difficulty: 'Medium' };

  const videoRef = useRef(null);
  const [code, setCode] = useState('// Write your solution here...\n\nfunction solution() {\n  \n}');
  const [language, setLanguage] = useState('JavaScript');
  const [output, setOutput] = useState('// Output will appear here');

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Camera Error:', err));
  }, []);

  const handleRun = () => {
    setOutput('Running tests...\n> Test Case 1: Passed\n> Test Case 2: Passed');
  };

  return (
    <div className="tech-container">
      {/* Background Layer */}
      <ColorBends
        colors={["#00c9ff", "#92fe9d", "#ff5c7a"]} // Bright Neon colors for visibility
        rotation={0}
        speed={0.2}
        scale={1.2}
        frequency={0.5}
        warpStrength={2}
        mouseInfluence={0.5}
        parallax={0.1}
        noise={0.2} 
        transparent={false} /* [FIX] Set to false to force opacity */
      />

      {/* Main UI Layer */}
      <div className="tech-ui-layer">
        
        {/* Header */}
        <header className="tech-header glass-panel">
          <div className="header-left">
              <button className="exit-btn" onClick={() => navigate('/home')}>← Exit</button>
              <span className="interview-meta">{company} • Technical • {difficulty}</span>
          </div>
          <div className="header-right">
              <button className="run-btn" onClick={handleRun}>▶ Run Code</button>
              <button className="submit-btn">Submit</button>
          </div>
        </header>

        {/* Workspace */}
        <div className="tech-workspace">
          
          {/* Left Panel */}
          <div className="panel left-panel">
              <div className="panel-header">
                  <h3>Problem Description</h3>
              </div>
              <div className="problem-content">
                  <h2>1. Two Sum</h2>
                  <span className={`difficulty-tag ${difficulty.toLowerCase()}`}>{difficulty}</span>
                  <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                  <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
                  
                  <h4>Example 1:</h4>
                  <div className="example-box">
                      <p><strong>Input:</strong> nums = [2,7,11,15], target = 9</p>
                      <p><strong>Output:</strong> [0,1]</p>
                      <p><strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                  </div>
              </div>
          </div>

          {/* Right Panel */}
          <div className="panel right-panel">
              <div className="editor-header">
                  <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="lang-select"
                  >
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                  </select>
                  <span className="editor-settings">⚙</span>
              </div>
              
              <div className="code-area-wrapper">
                  <textarea 
                      className="code-editor"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck="false"
                  ></textarea>
              </div>

              <div className="console-area">
                  <div className="panel-header small">Console</div>
                  <pre className="console-output">{output}</pre>
              </div>
          </div>
        </div>

        {/* Floating Camera */}
        <div className="floating-camera">
          <video ref={videoRef} autoPlay playsInline muted />
          <div className="cam-label">You</div>
        </div>
      </div>

    </div>
  );
}

export default InterviewTechnical;