import React, { useState, useRef } from 'react';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InterviewBehavioral.css';

import Mic from '../svg/mic';
import Micw from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState("Introduction");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef(null);
  const analyserRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  const streamRef = useRef(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // -------------------------
  // Start Interview
  // -------------------------
  // -------------------------
  // Start Interview
  // -------------------------
  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }


      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;


      detectAudioLevel();
      setIsInterviewStarted(true);

    } catch (err) {
      console.error('Failed to start interview:', err);
      alert('Microphone access failed.');
      console.error('Failed to start interview:', err);
      alert('Microphone access failed.');
    }
  };

  // -------------------------
  // Mic Level Visualizer
  // -------------------------
  // -------------------------
  // Mic Level Visualizer
  // -------------------------
  const detectAudioLevel = () => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const avg = data.reduce((a, b) => a + b, 0) / data.length;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setMicLevel(Math.floor(avg));


    requestAnimationFrame(detectAudioLevel);
  };

  // -------------------------
  // Start Recording (WebM only)
  // -------------------------
  const startRecording = () => {
    if (!streamRef.current || isLoading || isRecording) return;

    try {
      audioChunksRef.current = [];

      // 🔑 CLONE the audio track (critical fix)
      const audioTrack = streamRef.current.getAudioTracks()[0];
      const recordingStream = new MediaStream([audioTrack.clone()]);

      const recorder = new MediaRecorder(recordingStream, {
        mimeType: 'audio/webm'
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });

        mediaRecorderRef.current = null;
        handleAudioSubmit(blob);
      };

      recorder.start(); // ✅ stable
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

    } catch (err) {
      console.error('Recorder start failed:', err);
      alert('Recording failed to start.');
    }
  };

  // -------------------------
  // Stop Recording
  // -------------------------
  const stopRecording = () => {
  // -------------------------
  // Start Recording (WebM only)
  // -------------------------
  const startRecording = () => {
    if (!streamRef.current || isLoading || isRecording) return;

    try {
      audioChunksRef.current = [];

      // 🔑 CLONE the audio track (critical fix)
      const audioTrack = streamRef.current.getAudioTracks()[0];
      const recordingStream = new MediaStream([audioTrack.clone()]);

      const recorder = new MediaRecorder(recordingStream, {
        mimeType: 'audio/webm'
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });

        mediaRecorderRef.current = null;
        handleAudioSubmit(blob);
      };

      recorder.start(); // ✅ stable
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

    } catch (err) {
      console.error('Recorder start failed:', err);
      alert('Recording failed to start.');
    }
  };

  // -------------------------
  // Stop Recording
  // -------------------------
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // -------------------------
  // Toggle Recording
  // -------------------------
  const toggleRecording = () => {

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // -------------------------
  // Toggle Recording
  // -------------------------
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      stopRecording();
    } else {
      startRecording();
      startRecording();
    }
  };

  // -------------------------
  // Send Audio
  // -------------------------
  // -------------------------
  // Send Audio
  // -------------------------
  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);

    const lastAiMessage =
      [...messages].reverse().find(m => m.role === 'ai')?.text || '';


    const lastAiMessage =
      [...messages].reverse().find(m => m.role === 'ai')?.text || '';

    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('question', lastAiMessage);
    formData.append('question', lastAiMessage);

    try {
      const response = await fetch(
        'http://localhost:5001/api/process-audio',
        {
          method: 'POST',
          body: formData
        }
      );

      const response = await fetch(
        'http://localhost:5001/api/process-audio',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      processResponse(data);

    } catch (err) {
      console.error('Upload failed:', err);

    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // Handle Backend Response
  // -------------------------
  // -------------------------
  // Handle Backend Response
  // -------------------------
  const processResponse = (data) => {
    if (data.user_transcription) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: data.user_transcription }
      ]);
      setMessages(prev => [
        ...prev,
        { role: 'user', text: data.user_transcription }
      ]);
    }

    const aiText = data.reply || data.ai_response;
    if (aiText) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: aiText }
      ]);

    const aiText = data.reply || data.ai_response;
    if (aiText) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: aiText }
      ]);
    }


    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.onplay = () => setIsAiSpeaking(true);
      audio.onended = () => setIsAiSpeaking(false);
      audio.play();
      audio.play();
    }
  };

  // -------------------------
  // UI
  // -------------------------
  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="interview-container">
      {!isInterviewStarted && (
        <div className="start-overlay">
          <button className="start-btn" onClick={startInterview}>
            Start Interview
          </button>
          <button className="start-btn" onClick={startInterview}>
            Start Interview
          </button>
        </div>
      )}

      <header className="interview-header">
        <button onClick={() => navigate('/')}>Exit</button>
        <span>Mock Interview</span>
        <button onClick={() => navigate('/')}>Exit</button>
        <span>Mock Interview</span>
      </header>

      <main className="interview-main">
        <div className="video-grid">
          <div className={`video-box ${isAiSpeaking ? 'speaking' : ''}`}>
            <div className="ai-avatar">👨‍💼</div>
            Marcus {isAiSpeaking && '🔊'}
          </div>

          <div className={`video-box ${isRecording ? 'speaking' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline />
            You {isRecording ? '🔴 Rec' : '🎙️'} (Vol {micLevel})
          </div>
          <div className={`video-box ${isAiSpeaking ? 'speaking' : ''}`}>
            <div className="ai-avatar">👨‍💼</div>
            Marcus {isAiSpeaking && '🔊'}
          </div>

          <div className={`video-box ${isRecording ? 'speaking' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline />
            You {isRecording ? '🔴 Rec' : '🎙️'} (Vol {micLevel})
          </div>
        </div>
      </main>

      <footer className="interview-footer">
        <button
          className={`mic-button ${isRecording ? 'active' : ''}`}
          onClick={toggleRecording}
        <button
          className={`mic-button ${isRecording ? 'active' : ''}`}
          onClick={toggleRecording}
          disabled={isLoading}
        >
          {isRecording ? <Micw /> : <Mic />}
          {isRecording ? <Micw /> : <Mic />}
        </button>
      </footer>
    </div>
  );
}

export default InterviewBehavioral;

