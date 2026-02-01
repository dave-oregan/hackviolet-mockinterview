import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Interview.css';
import Mic from '../svg/mic';
import MicW from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isMicOn, setIsMicOn] = useState(false);
  const [transcripts, setTranscripts] = useState([]);

  /* -------- Camera + Microphone Activation -------- */
  useEffect(() => {
    let stream;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        mediaRecorderRef.current = new MediaRecorder(mediaStream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = handleAudioStop;
      })
      .catch((err) => {
        console.error('Media device error:', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /* -------- Handle Mic Toggle -------- */
  const toggleMic = () => {
    if (!mediaRecorderRef.current) return;

    if (!isMicOn) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    } else {
      mediaRecorderRef.current.stop();
    }

    setIsMicOn((prev) => !prev);
  };

  /* -------- Send Audio to Whisper -------- */
  const handleAudioStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'speech.webm');

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.text) {
        setTranscripts((prev) => [...prev, data.text]);
      }
    } catch (err) {
      console.error('Transcription error:', err);
    }
  };

  return (
    <div className="interview-container">
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
    </div>
  );
}

export default InterviewBehavioral;
