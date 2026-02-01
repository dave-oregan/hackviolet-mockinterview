import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, MessageSquare, RefreshCcw, Home, Award } from 'lucide-react';
import '../css/InterviewBehavioral.css';

import SpotlightCard from './SpotlightCard';
import Mic from '../svg/mic';
import Micw from '../svg/micw';

/* ------------------------------------
    FIXED: ACCURATE CIRCULAR METRIC
------------------------------------ */
const CircularMetric = ({ progress, label, delay = 0 }) => {
  const size = 100;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Mathematically ensures 100% is a complete circle
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="metric-item">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth={stroke} 
            fill="transparent" 
            r={radius} 
            cx={size / 2} 
            cy={size / 2}
          />
          <motion.circle
            stroke="url(#metric-gradient)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            r={radius} 
            cx={size / 2} 
            cy={size / 2}
          />
          <defs>
            <linearGradient id="metric-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        {/* Percentage perfectly centered within the ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white leading-none">{progress}%</span>
        </div>
      </div>
      <span className="metric-label">{label}</span>
    </div>
  );
};

/* ------------------------------------
   MOCK REPORT (replace with backend)
------------------------------------ */
const report = {
  video_analysis: {
    score: 82,
    categories: {
      gaze_stability: { score: 78, feedback: 'Good eye contact overall.' },
      posture_professionalism: { score: 85, feedback: 'Professional posture maintained.' },
      fidget_detection: { score: 80, feedback: 'Minimal distracting movements.' }
    }
  },
  audio_analysis: {
    score: 88,
    categories: {
      vocal_clarity: { score: 90, feedback: 'Clear and understandable voice.' },
      pacing_and_flow: { score: 84, feedback: 'Good pacing with minor rushes.' },
      tone_and_confidence: { score: 89, feedback: 'Confident and steady tone.' }
    }
  },
  overall_analysis: {
    final_score: 86,
    interview_persona: 'Confident Communicator',
    summary: 'Strong overall performance with clear communication and professional presence.',
    top_strengths: ['Vocal clarity', 'Professional posture'],
    improvement_priorities: ['Eye contact consistency', 'Answer pacing']
  }
};

const ScoreCard = ({ title, score, subtitle }) => (
  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
    <h3>{title}</h3>
    <p style={{ fontSize: '2.2rem', fontWeight: 700 }}>{score}</p>
    {subtitle && <p style={{ opacity: 0.7 }}>{subtitle}</p>}
  </SpotlightCard>
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
  const audioChunksRef = useRef([]);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      detectAudioLevel();
      setIsInterviewStarted(true);
    } catch (err) {
      console.error(err);
      alert('Microphone access failed.');
    }
  };

  const endInterview = () => {
    if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    analyserRef.current = null;
    setMicLevel(0);
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

  const startRecording = () => {
    if (!streamRef.current || isLoading || isRecording) return;
    audioChunksRef.current = [];
    const audioTrack = streamRef.current.getAudioTracks()[0];
    const recordingStream = new MediaStream([audioTrack.clone()]);
    const recorder = new MediaRecorder(recordingStream, { mimeType: 'audio/webm' });
    recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    recorder.onstop = () => { const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); handleAudioSubmit(blob); };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => { if (!mediaRecorderRef.current) return; mediaRecorderRef.current.stop(); setIsRecording(false); };
  const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

  const handleAudioSubmit = async audioBlob => {
    setIsLoading(true);
    const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai')?.text || '';
    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('question', lastAiMessage);
    try {
      const response = await fetch('http://localhost:5001/api/process-audio', { method: 'POST', body: formData });
      const data = await response.json();
      processResponse(data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
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
          {isRecording ? <Micw /> : <Mic />}
        </button>
      </footer>

      <AnimatePresence>
        {showEndModal && (
          <div className="end-modal-overlay">
            <motion.div 
              className="end-modal professional-dashboard"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="dashboard-header">
                <div className="header-info">
                  {/* Larger, professional font for company tag */}
                  <div className="company-tag-large uppercase">
                    {localStorage.getItem('company-key') || 'Session Complete'}
                  </div>
                  <h1 className="dashboard-title">Interview Summary</h1>
                </div>
                {/* Score pill moved left via CSS class */}
                <div className="overall-score-pill score-pill-adjusted">
                  <Award size={20} className="text-purple-400" />
                  <div className="pill-divider" />
                  <div className="pill-content">
                    <span className="pill-num">{report.overall_analysis.final_score}</span>
                    <span className="pill-sub">OVERALL</span>
                  </div>
                </div>
              </div>

              <div className="metrics-grid">
                <CircularMetric progress={report.overall_analysis.final_score} label="Overall" delay={0.3} />
                <CircularMetric progress={report.video_analysis.score} label="Video" delay={0.4} />
                <CircularMetric progress={report.audio_analysis.score} label="Audio" delay={0.5} />
                <CircularMetric progress={report.video_analysis.categories.gaze_stability.score} label="Focus" delay={0.6} />
              </div>

              <div className="insights-panel">
                <div className="panel-title">
                  <MessageSquare size={18} className="text-indigo-400" />
                  <span>AI INSIGHTS & FEEDBACK</span>
                </div>
                <p className="feedback-content italic">
                  "{report.overall_analysis.summary}"
                </p>
                <div className="analysis-breakdown-grid">
                    <div className="analysis-column">
                        <strong className="column-label">Top Strengths</strong>
                        <p className="column-text text-cyan-400">{report.overall_analysis.top_strengths.join(', ')}</p>
                    </div>
                    <div className="analysis-column">
                        <strong className="column-label">Improvement Priorities</strong>
                        <p className="column-text text-purple-400">{report.overall_analysis.improvement_priorities.join(', ')}</p>
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