import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Interview.css';
import Mic from '../svg/mic';
import MicW from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const transcriptRef = useRef(''); // holds speech until mic off

  /* -------------------- Camera (video only) -------------------- */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false }) // IMPORTANT: no audio
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error('Camera Error:', err));
  }, []);

  /* ---------------- Speech Recognition Init ---------------- */
  useEffect(() => {
    if (!window.SpeechRecognition) {
      console.error('SpeechRecognition not supported');
      return;
    }

    const recognition = new window.SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let chunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        chunk += event.results[i][0].transcript;
      }
      transcriptRef.current += chunk;
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e);
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []);

  /* ---------------- Mic Toggle ---------------- */
  const handleMicToggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();

      // OUTPUT TRANSCRIPT WHEN MIC TURNS OFF
      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) {
        console.log('🎤 Final Transcript:', finalTranscript);
      }

      transcriptRef.current = '';
      setIsListening(false);
    } else {
      transcriptRef.current = '';
      recognition.start();
      setIsListening(true);
    }
  };

  const handleExit = () => {
    navigate('/home');
  };

  return (
    <div className="interview-container">
      <div className="interview-header">
        <button className="interview-exit" onClick={handleExit}>
          ← Exit
        </button>
        <button className="interview-settings">⚙ Settings</button>
      </div>

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

      <div className="interview-footer">
        <button
          className={`mic-button ${isListening ? 'active' : ''}`}
          onClick={handleMicToggle}
        >
          {isListening ? <MicW /> : <Mic />}
        </button>
      </div>
    </div>
  );
}

export default InterviewBehavioral;
