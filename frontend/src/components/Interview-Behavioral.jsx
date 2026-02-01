import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InterviewBehavioral.css';

import Mic from '../svg/mic';
import Micw from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 1. Initialize System
  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: { echoCancellation: true } 
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Setup Visualizer
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Wake up AudioContext if suspended (Browser fix)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      detectAudioLevel();

      // Setup Recorder
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        handleAudioSubmit(audioBlob);
      };
      mediaRecorderRef.current = recorder;
      setIsInterviewStarted(true);

    } catch (err) {
      console.error("Error:", err);
      alert("Microphone access denied. You can still type.");
      setIsInterviewStarted(true); // Allow entry even if mic fails
    }
  };

  // 2. Audio Level Visualizer
  const detectAudioLevel = () => {
    if (!analyserRef.current) return;
    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(array);
    const avg = array.reduce((a, b) => a + b) / array.length;
    setMicLevel(Math.floor(avg));
    requestAnimationFrame(detectAudioLevel);
  };

  // 3. Toggle Recording
  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  // 4. Handle AUDIO Submission
  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');

    try {
      const response = await fetch('http://localhost:5001/api/process-audio', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      processResponse(data);
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle TEXT Submission (New!)
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // Clear input
    setIsLoading(true);

    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      processResponse(data);
    } catch (error) {
      console.error("Error sending text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to handle backend response (Used by both Text and Audio)
  const processResponse = (data) => {
    if (data.user_transcription) {
      setMessages(prev => [...prev, { role: 'user', text: data.user_transcription }]);
    }
    if (data.reply || data.ai_response) {
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || data.ai_response }]);
    }
    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.onplay = () => setIsAiSpeaking(true);
      audio.onended = () => setIsAiSpeaking(false);
      audio.play().catch(e => console.error("Audio playback error:", e));
    }
  };

  return (
    <div className="interview-container">
      {!isInterviewStarted && (
        <div className="start-overlay">
          <button className="start-btn" onClick={startInterview}>Start Interview</button>
        </div>
      )}

      <header className="interview-header">
         <button className="interview-exit" onClick={() => navigate('/')}>Exit</button>
         <span className="timer">Mock Interview: {localStorage.getItem("company-key")}</span>
         <button className="interview-settings">End Meeting</button>
      </header>

      <main className="interview-main">
        <div className="video-grid">
           {/* AI Box */}
           <div className={`video-box ${isAiSpeaking ? 'speaking' : ''}`}>
             <div className="placeholder-video"><div className="ai-avatar">👨‍💼</div></div>
             <div className="video-label">Marcus {isAiSpeaking && '🔊'}</div>
           </div>
           
           {/* User Box */}
           <div className={`video-box ${isRecording ? 'speaking' : ''}`}>
             <video ref={videoRef} autoPlay muted playsInline />
             <div className="video-label">
               You {isRecording ? '🔴 Rec' : '🎙️'} (Vol: {micLevel})
             </div>
           </div>
        </div>

        {/* Chat Transcript Overlay (Optional - to see history) */}
        <div style={{ position: 'absolute', bottom: '100px', left: '2rem', right: '2rem', maxHeight: '150px', overflowY: 'auto', pointerEvents: 'none' }}>
           {messages.slice(-2).map((m, i) => (
             <div key={i} style={{ background: m.role === 'ai' ? 'rgba(0,0,0,0.6)' : 'rgba(108, 92, 231, 0.6)', padding: '8px', marginBottom: '4px', borderRadius: '4px', width: 'fit-content', marginLeft: m.role === 'user' ? 'auto' : '0' }}>
               {m.text}
             </div>
           ))}
        </div>
      </main>

      <footer className="interview-footer">
        <button 
          className={`mic-button ${isRecording ? 'active' : ''}`} 
          onClick={toggleRecording} 
          disabled={isLoading}
        >
          {isRecording ? (<Micw />) : (<Mic />)}
        </button>
        
      </footer>
    </div>
  );
}

export default InterviewBehavioral;