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

  /* -------------------------
     Audio Recording Refs
  ------------------------- */
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  /* -------------------------
     State
  ------------------------- */
  const [code, setCode] = useState(`// Write your solution here

function solution(nums, target) {
  // your code
}
`);
  const [language, setLanguage] = useState('JavaScript');
  const [output, setOutput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  /* -------------------------
     Camera (Video Only)
  ------------------------- */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});
  }, []);

  /* -------------------------
     Recording Logic
  ------------------------- */
  const startRecording = async () => {
    if (isRecording || isLoading) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        handleAudioSubmit(audioBlob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert('Microphone access failed.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isLoading) return;
    isRecording ? stopRecording() : startRecording();
  };

  /* -------------------------
     Backend Audio Submit
  ------------------------- */
  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('context', 'technical-interview');

    try {
      const response = await fetch(
        'http://localhost:5001/api/process-audio',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.user_transcription) {
        console.log('User transcription:', data.user_transcription);
      }

      if (data.reply || data.ai_response) {
        console.log('AI reply:', data.reply || data.ai_response);
      }

      if (data.audio) {
        const audio = new Audio(
          `data:audio/mpeg;base64,${data.audio}`
        );
        audio.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------
     Code Runner
  ------------------------- */
  const handleRun = () => {
    if (language !== 'JavaScript') {
      setOutput('❌ Only JavaScript is supported.');
      return;
    }

    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) =>
      logs.push(
        args
          .map((a) =>
            typeof a === 'object' ? JSON.stringify(a) : String(a)
          )
          .join(' ')
      );

    console.error = (...args) =>
      logs.push('❌ ' + args.map((a) => String(a)).join(' '));

    try {
      const fn = new Function(`
        ${code}
        if (typeof solution === 'function') return solution;
      `);

      const solutionFn = fn();
      if (typeof solutionFn === 'function') {
        solutionFn([2, 7, 11, 15], 9);
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

  /* -------------------------
     UI
  ------------------------- */
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
        {/* LEFT */}
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

        {/* RIGHT */}
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

          <div className="bottom-row">
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

      {/* Mic Button */}
      <button
        className={`floating-mic ${isRecording ? 'active' : ''}`}
        onClick={toggleRecording}
        disabled={isLoading}
      >
        {isRecording ? <Micw /> : <Mic />}
      </button>
    </div>
  );
}

export default InterviewTechnical;