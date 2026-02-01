<<<<<<< HEAD
import React, { useState, useRef } from 'react';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
import { useNavigate } from 'react-router-dom';
import '../css/Interview.css';
import Mic from '../svg/mic';
import MicW from '../svg/micw';

import Mic from '../svg/mic';
import Micw from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // --- NEW: Timing References ---
  const interviewStartRef = useRef(null);
  const responseStartRef = useRef(null);
  
=======
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

<<<<<<< HEAD
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
=======
  const [isMicOn, setIsMicOn] = useState(false);
  const [transcripts, setTranscripts] = useState([]);

  /* -------- Camera + Microphone Activation -------- */
  useEffect(() => {
    let stream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        stream = mediaStream;

        if (videoRef.current) videoRef.current.srcObject = mediaStream;

        try {
          const option = { mimeType: 'video/webm' }; 

          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            option.mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            option.mimeType = 'video/webm';
          }

          mediaRecorderRef.current = new MediaRecorder(mediaStream, option);
        } catch (err) {
          console.error('Failed to create MediaRecorder:', err);
          return;
        }

        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = handleAudioStop;
      })
      .catch((err) => console.error('Media device error:', err));

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /* -------- Handle Mic Toggle -------- */
  const toggleMic = () => {
    if (!mediaRecorderRef.current) return;

    try {
      if (!isMicOn) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
      } else {
        mediaRecorderRef.current.stop();
      }
      setIsMicOn((prev) => !prev);
    } catch (err) {
      console.error('MediaRecorder start/stop error:', err);
    }
  };

  /* -------- Send Audio to Whisper -------- */
  const handleAudioStop = async () => {
    if (!audioChunksRef.current.length) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: "webp" });
    const formData = new FormData();
    formData.append('file', audioBlob, `speech.webm`);
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45

    try {
<<<<<<< HEAD
      const response = await fetch('http://localhost:5001/api/process-audio', {
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
<<<<<<< HEAD
      const response = await fetch('http://localhost:5000/api/end-session', {
=======
      const response = await fetch('http://localhost:5001/api/chat', {
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
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
<<<<<<< HEAD
      audio.play();
=======
      audio.play().catch(e => console.error("Audio playback error:", e));
=======
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      console.log(data)
      if (data.text) setTranscripts((prev) => [...prev, data.text]);
    } catch (err) {
      console.error('Transcription error:', err);
>>>>>>> parent of 1775e5e (THIS WORKS BRO)
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
    }
  };

  return (
    <div className="interview-container">
<<<<<<< HEAD
      {!isInterviewStarted && (
        <div className="start-overlay"><button className="start-btn" onClick={startInterview}>Start</button></div>
      )}

      <header className="interview-header">
         <button className="interview-exit" onClick={() => navigate('/')}>Exit</button>
<<<<<<< HEAD
         <span className="timer">Mock Interview</span>
         <button className="interview-settings" onClick={handleEndMeeting}>End Meeting</button>
=======
         <span className="timer">Mock Interview: {localStorage.getItem("company-key")}</span>
         <button className="interview-settings">End Meeting</button>
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
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
<<<<<<< HEAD
        <button className="mic-button" onClick={toggleRecording} disabled={isLoading}>
          {isRecording ? '🛑' : '🎤'}
        </button>
=======
        <button 
          className={`mic-button ${isRecording ? 'active' : ''}`} 
          onClick={toggleRecording} 
          disabled={isLoading}
        >
          {isRecording ? (<Micw />) : (<Mic />)}
        </button>
        
>>>>>>> b934f6ee9cf3a322c79a6ae43cebc6b49c8d5d45
      </footer>
=======
      {/* Header */}
      <div className="interview-header">
        <button className="interview-exit" onClick={() => navigate('/home')}>
          ← Exit
        </button>

        <button
          className="interview-settings"
          onClick={() => console.log('Transcripts:', transcripts)}
        >
          ⚙ Settings
        </button>
      </div>

      {/* Main */}
      <div className="interview-main">
        <div className="video-grid">
          <div className="video-box user-video">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="video-label">You</div>
          </div>

          <div className="video-box interviewer-video">
            <div className="placeholder-video">AI Interviewer</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="interview-footer">
        <button
          className={`mic-button ${isMicOn ? 'active' : ''}`}
          onClick={toggleMic}
        >
          {isMicOn ? <MicW /> : <Mic />}
        </button>
      </div>
>>>>>>> parent of 1775e5e (THIS WORKS BRO)
    </div>
  );
}

export default InterviewBehavioral;
