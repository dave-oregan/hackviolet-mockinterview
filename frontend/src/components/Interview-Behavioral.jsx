import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, MessageSquare, RefreshCcw, Home, Award } from 'lucide-react';
import '../css/InterviewBehavioral.css';
import MicIcon from '../svg/mic';
import MicwIcon from '../svg/micw';

/* ------------------------------------
   Helper Component: CircularMetric
------------------------------------ */
const CircularMetric = ({ progress, label, delay }) => (
  <motion.div 
    className="metric-item"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="metric-circle-container">
      <svg viewBox="0 0 36 36" className="circular-chart">
        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <motion.path
          className="circle"
          strokeDasharray={`${progress}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 1.5, delay }}
        />
        <text x="18" y="20.35" className="percentage">{progress}%</text>
      </svg>
    </div>
    <span className="metric-label">{label}</span>
  </motion.div>
);

function InterviewBehavioral() {
  const navigate = useNavigate();

  const [showEndModal, setShowEndModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const videoRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const interviewStartRef = useRef(null);
  const responseStartRef = useRef(null);
  const audioChunksRef = useRef([]); // Fixed: Removed duplicate declaration
  const fullSessionRecorderRef = useRef(null);
  const [finalReport, setFinalReport] = useState(null);
  const hasInitialized = useRef(false); // ← ADD THIS LINE


  /* -------------------------
      Interview Logic
  ------------------------- */
  const startInterview = async () => {
    // ← ADD THIS CHECK
    if (hasInitialized.current) {
      console.log("Already initialized, skipping...");
      return;
    }
    hasInitialized.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: { echoCancellation: true } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      interviewStartRef.current = Date.now();

      // Setup Video Session Recording
      const fullVideoChunks = [];
      const videoRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      videoRecorder.ondataavailable = e => { if (e.data.size > 0) fullVideoChunks.push(e.data); };
      videoRecorder.onstop = async () => {
        const blob = new Blob(fullVideoChunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'session.webm');
        // Finalize logic handled in endInterview
      };
      videoRecorder.start();
      fullSessionRecorderRef.current = videoRecorder; 
      
      // Audio Visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      const userUuid = localStorage.getItem("uid");
      const response = await fetch('http://localhost:3001/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();      
      processResponse(data);
      detectAudioLevel();
      setIsInterviewStarted(true);
    } catch (err) {
      console.error("Initialization error:", err);
      alert("Mic and Camera access are required.");
    }
  };

  const endInterview = async() => {
    const recorder = fullSessionRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = async () => {
        // Use standard approach for accessing recorded chunks
        const blob = new Blob(audioChunksRef.current, { type: 'video/webm' }); 
        const formData = new FormData();
        formData.append('video', blob, 'session.webm');

        try {
          const response = await fetch('http://localhost:3001/api/finalize', {
            method: 'POST',
            body: formData
          });
          const reportData = await response.json();
          setFinalReport(reportData); 
        } catch (err) {
          console.error("Final Analysis Error:", err);
        }
      };
      recorder.stop();
    }

    // Cleanup tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    
    setShowEndModal(true);
  };

  const detectAudioLevel = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setMicLevel(Math.floor(avg));
    requestAnimationFrame(detectAudioLevel);
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      if (!streamRef.current || isLoading) return;
      audioChunksRef.current = [];
      responseStartRef.current = Date.now(); // Track when answer starts
      const audioTrack = streamRef.current.getAudioTracks()[0];
      const recordingStream = new MediaStream([audioTrack.clone()]);
      const recorder = new MediaRecorder(recordingStream, { mimeType: 'audio/webm' });
      
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleAudioSubmit(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const handleAudioSubmit = async (audioBlob) => {
    setIsLoading(true);
    const endTime = Date.now();
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai')?.text || '';
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('response_start', responseStartRef.current);
    formData.append('response_end', endTime);
    formData.append('interview_start', interviewStartRef.current);
    formData.append('uuid', localStorage.getItem("uid"));

    try {
      const response = await fetch('http://localhost:3001/api/process-audio', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      processResponse(data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const processResponse = data => {
    if (data.user_transcription) setMessages(prev => [...prev, { role: 'user', text: data.user_transcription }]);
    if (data.reply || data.ai_response) setMessages(prev => [...prev, { role: 'ai', text: data.reply || data.ai_response }]);
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
        <div className="start-overlay">
          <button className="start-btn" onClick={startInterview}>Start Interview</button>
        </div>
      )}

      <header className="interview-header">
        <button className="interview-exit" onClick={() => navigate('/')}>Exit</button>
        <span className="timer">Mock Interview: {localStorage.getItem('company-key')}</span>
        <button className="interview-settings" onClick={endInterview}>End Meeting</button>
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
        </div>
      </main>

      <footer className="interview-footer">
        <button className={`mic-button ${isRecording ? 'active' : ''}`} onClick={toggleRecording} disabled={isLoading}>
          {isRecording ? <MicwIcon /> : <MicIcon />}
        </button>
      </footer>

      <AnimatePresence>
        {showEndModal && finalReport && (
          <div className="end-modal-overlay">
            <motion.div 
              className="end-modal professional-dashboard"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="dashboard-header">
                <div className="header-info">
                  <div className="company-tag-large uppercase">
                    {localStorage.getItem('company-key') || 'Session Complete'}
                  </div>
                  <h1 className="dashboard-title">Interview Summary</h1>
                </div>
                <div className="overall-score-pill score-pill-adjusted">
                  <Award size={20} className="text-purple-400" />
                  <div className="pill-divider" />
                  <div className="pill-content">
                    <span className="pill-num">{finalReport.overall_analysis?.final_score}</span>
                    <span className="pill-sub">OVERALL</span>
                  </div>
                </div>
              </div>

              <div className="metrics-grid">
                <CircularMetric progress={finalReport.overall_analysis?.final_score || 0} label="Overall" delay={0.3} />
                <CircularMetric progress={finalReport.video_analysis?.score || 0} label="Video" delay={0.4} />
                <CircularMetric progress={finalReport.audio_analysis?.score || 0} label="Audio" delay={0.5} />
                <CircularMetric progress={finalReport.video_analysis?.categories?.gaze_stability?.score || 0} label="Focus" delay={0.6} />
              </div>

              <div className="insights-panel">
                <div className="panel-title">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <span>AI INSIGHTS & FEEDBACK</span>
                </div>
                <p className="feedback-content italic">
                  "{finalReport.overall_analysis?.summary}"
                </p>
                <div className="analysis-breakdown-grid">
                  <div className="analysis-column">
                    <strong className="column-label">Top Strengths</strong>
                    <p className="column-text text-cyan-400">{finalReport.overall_analysis?.top_strengths?.join(', ')}</p>
                  </div>
                  <div className="analysis-column">
                    <strong className="column-label">Improvement Priorities</strong>
                    <p className="column-text text-purple-400">{finalReport.overall_analysis?.improvement_priorities?.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-footer">
                <button className="dash-btn-secondary" onClick={() => navigate('/archive')}>
                  <RefreshCcw size={18} /> Detailed Report
                </button>
                <button className="dash-btn-primary" onClick={() => navigate('/')}>
                  Return Home <Home size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InterviewBehavioral;