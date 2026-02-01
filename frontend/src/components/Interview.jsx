import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Interview.css';

function Interview() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // States
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // New State
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
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      detectAudioLevel();

      // Setup Recorder (But don't start yet)
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = []; // Reset chunks
        handleAudioSubmit(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      setIsInterviewStarted(true);

    } catch (err) {
      console.error("Error:", err);
      alert("Microphone access denied.");
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

  // 3. Handle Mic Button Click
  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (isRecording) {
      // STOP RECORDING
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // START RECORDING
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  // 4. Send Audio to Backend
  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);
    
    // Create FormData to send file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');

    try {
      const response = await fetch('http://localhost:5000/api/process-audio', {
        method: 'POST',
        body: formData, // No Content-Type header needed (browser handles it)
      });

      const data = await response.json();

      // Update Chat UI
      if (data.user_transcription) {
        setMessages(prev => [...prev, { role: 'user', text: data.user_transcription }]);
      }
      if (data.ai_response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.ai_response }]);
      }

      // Play Audio
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        audio.onplay = () => setIsAiSpeaking(true);
        audio.onended = () => setIsAiSpeaking(false);
        audio.play();
      }

    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="interview-container">
      {!isInterviewStarted && (
        <div className="start-overlay">
          <button className="start-btn" onClick={startInterview}>Start Interview</button>
        </div>
      )}

      {/* Main Grid & Header (Same as before) */}
      <header className="interview-header">
         <button className="interview-exit" onClick={() => navigate('/')}>Exit</button>
         <span className="timer">Mock Interview: Goldman Sachs</span>
         <button className="interview-settings">Settings</button>
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
      </main>

      <footer className="interview-footer">
        {/* THE RECORD BUTTON */}
        <button 
          className={`mic-button ${isRecording ? 'active' : ''}`}
          onClick={toggleRecording}
          disabled={isLoading}
        >
          {isRecording ? '🛑' : '🎤'}
        </button>

        <div className="input-wrapper">
          <input 
            className="chat-input"
            value={isLoading ? "Processing audio..." : input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type or click mic to speak..."}
            disabled
          />
        </div>
      </footer>
    </div>
  );
}

export default Interview;