import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InterviewBehavioral.css';

function InterviewBehavioral() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // --- NEW: Timing References ---
  const interviewStartRef = useRef(null);
  const responseStartRef = useRef(null);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Capture Global Start Time
      interviewStartRef.current = Date.now();

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        // Capture Response End Time
        const responseEndTime = Date.now();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        handleAudioSubmit(audioBlob, responseStartRef.current, responseEndTime);
      };

      mediaRecorderRef.current = recorder;
      setIsInterviewStarted(true);
      
      // Initialize the backend session
      await fetch('http://localhost:5000/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: "user@example.com", company: "Goldman Sachs" })
      });

    } catch (err) { alert("Mic/Camera access required."); }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Capture individual response start time
      responseStartRef.current = Date.now();
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handleAudioSubmit = async (audioBlob, startTime, endTime) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('response_start', startTime);
    formData.append('response_end', endTime);
    formData.append('interview_start', interviewStartRef.current);

    try {
      const response = await fetch('http://localhost:5000/api/process-audio', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      processResponse(data);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleEndMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ended_early: true })
      });
      const data = await response.json();
      alert(`Interview Ended. Score: ${data.audio.audio_score}\nFeedback: ${data.audio.feedback.overall_feedback}`);
      navigate('/');
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const processResponse = (data) => {
    if (data.user_transcription) setMessages(p => [...p, { role: 'user', text: data.user_transcription }]);
    if (data.ai_response) setMessages(p => [...p, { role: 'ai', text: data.ai_response }]);
    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.onplay = () => setIsAiSpeaking(true);
      audio.onended = () => setIsAiSpeaking(false);
      audio.play();
    }
  };

  return (
    <div className="interview-container">
      {!isInterviewStarted && (
        <div className="start-overlay"><button className="start-btn" onClick={startInterview}>Start</button></div>
      )}

      <header className="interview-header">
         <button className="interview-exit" onClick={() => navigate('/')}>Exit</button>
         <span className="timer">Mock Interview</span>
         <button className="interview-settings" onClick={handleEndMeeting}>End Meeting</button>
      </header>

      <main className="interview-main">
        <div className="video-grid">
           <div className={`video-box ${isAiSpeaking ? 'speaking' : ''}`}>AI</div>
           <div className={`video-box ${isRecording ? 'speaking' : ''}`}>
             <video ref={videoRef} autoPlay muted playsInline />
           </div>
        </div>
      </main>

      <footer className="interview-footer">
        <button className="mic-button" onClick={toggleRecording} disabled={isLoading}>
          {isRecording ? '🛑' : '🎤'}
        </button>
      </footer>
    </div>
  );
}

export default InterviewBehavioral;