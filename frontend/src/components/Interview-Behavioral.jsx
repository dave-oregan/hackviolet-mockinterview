import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/InterviewBehavioral.css';

import SpotlightCard from './SpotlightCard';
import Mic from '../svg/mic';
import Micw from '../svg/micw';

/* ------------------------------------
   MOCK REPORT (replace with backend)
------------------------------------ */
const report = {
  video_analysis: {
    score: 82,
    categories: {
      gaze_stability: {
        score: 78,
        feedback: 'Good eye contact overall.'
      },
      posture_professionalism: {
        score: 85,
        feedback: 'Professional posture maintained.'
      },
      fidget_detection: {
        score: 80,
        feedback: 'Minimal distracting movements.'
      }
    }
  },
  audio_analysis: {
    score: 88,
    categories: {
      vocal_clarity: {
        score: 90,
        feedback: 'Clear and understandable voice.'
      },
      pacing_and_flow: {
        score: 84,
        feedback: 'Good pacing with minor rushes.'
      },
      tone_and_confidence: {
        score: 89,
        feedback: 'Confident and steady tone.'
      }
    }
  },
  overall_analysis: {
    final_score: 86,
    interview_persona: 'Confident Communicator',
    summary:
      'Strong overall performance with clear communication and professional presence.',
    top_strengths: ['Vocal clarity', 'Professional posture'],
    improvement_priorities: ['Eye contact consistency', 'Answer pacing']
  }
};

/* ------------------------------------
   Reusable Card
------------------------------------ */
const ScoreCard = ({ title, score, subtitle }) => (
  <SpotlightCard
    className="custom-spotlight-card"
    spotlightColor="rgba(0, 229, 255, 0.2)"
  >
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

  /* -------------------------
     Start Interview
  ------------------------- */
  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

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
      console.error(err);
      alert('Microphone access failed.');
    }
  };

  const endInterview = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setMicLevel(0);
    setShowEndModal(true);
  };

  /* -------------------------
     Mic Level Visualizer
  ------------------------- */
  const detectAudioLevel = () => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setMicLevel(Math.floor(avg));

    requestAnimationFrame(detectAudioLevel);
  };

  /* -------------------------
     Recording Logic
  ------------------------- */
  const startRecording = () => {
    if (!streamRef.current || isLoading || isRecording) return;

    audioChunksRef.current = [];

    const audioTrack = streamRef.current.getAudioTracks()[0];
    const recordingStream = new MediaStream([audioTrack.clone()]);

    const recorder = new MediaRecorder(recordingStream, {
      mimeType: 'audio/webm'
    });

    recorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, {
        type: 'audio/webm'
      });
      handleAudioSubmit(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  /* -------------------------
     Backend Audio
  ------------------------- */
  const handleAudioSubmit = async audioBlob => {
    setIsLoading(true);

    const lastAiMessage =
      [...messages].reverse().find(m => m.role === 'ai')?.text || '';

    const formData = new FormData();
    formData.append('audio', audioBlob, 'input.webm');
    formData.append('question', lastAiMessage);

    try {
      const response = await fetch(
        'http://localhost:5001/api/process-audio',
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      processResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const processResponse = data => {
    if (data.user_transcription) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text: data.user_transcription }
      ]);
    }

    if (data.reply || data.ai_response) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: data.reply || data.ai_response }
      ]);
    }

    if (data.audio) {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audio.onplay = () => setIsAiSpeaking(true);
      audio.onended = () => setIsAiSpeaking(false);
      audio.play();
    }
  };

  /* -------------------------
     UI
  ------------------------- */
  return (
    <div className="interview-container">
      {!isInterviewStarted && (
        <div className="start-overlay">
          <button className="start-btn" onClick={startInterview}>
            Start Interview
          </button>
        </div>
      )}

      <header className="interview-header">
        <button className="interview-exit" onClick={() => navigate('/')}>
          Exit
        </button>
        <span className="timer">
          Mock Interview: {localStorage.getItem('company-key')}
        </span>
        <button className="interview-settings" onClick={endInterview}>
          End Meeting
        </button>
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
        <button
          className={`mic-button ${isRecording ? 'active' : ''}`}
          onClick={toggleRecording}
          disabled={isLoading}
        >
          {isRecording ? <Micw /> : <Mic />}
        </button>
      </footer>

      {showEndModal && (
        <div className="end-modal-overlay">
          <div className="end-modal">
            <h2>Interview Complete: Your Results</h2>

            <div className="end-modal-content">
              <ScoreCard
                title="Final Score"
                score={report.overall_analysis.final_score}
                subtitle={report.overall_analysis.interview_persona}
              />
              <ScoreCard
                title="Video Score"
                score={report.video_analysis.score}
                subtitle="Body Language"
              />
              <ScoreCard
                title="Eye Contact"
                score={report.video_analysis.categories.gaze_stability.score}
              />
              <ScoreCard
                title="Posture"
                score={
                  report.video_analysis.categories.posture_professionalism.score
                }
              />
              <ScoreCard
                title="Audio Score"
                score={report.audio_analysis.score}
                subtitle="Speaking"
              />
              <ScoreCard
                title="Vocal Clarity"
                score={
                  report.audio_analysis.categories.vocal_clarity.score
                }
              />
            </div>

            <p style={{ marginTop: '1.5rem', opacity: 0.85 }}>
              {report.overall_analysis.summary}
            </p>

            <p>
              <strong>Top Strengths:</strong><br />
              {report.overall_analysis.top_strengths.join(', ')}
            </p>

            <p>
              <strong>Improvement Priorities:</strong><br />
              {report.overall_analysis.improvement_priorities.join(', ')}
            </p>

            <div className="end-modal-footer">
              <button
                className="end-modal-exit"
                onClick={() => navigate('/archive')}
              >
                See further breakdown
              </button>
              <button
                className="end-modal-exit"
                onClick={() => navigate('/')}
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewBehavioral;
