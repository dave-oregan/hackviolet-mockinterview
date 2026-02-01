import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Interview.css';
import Mic from '../svg/mic';
import MicW from '../svg/micw';

import Mic from '../svg/mic';
import Micw from '../svg/micw';

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

    try {
<<<<<<< HEAD
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
=======
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      console.log(data)
      if (data.text) setTranscripts((prev) => [...prev, data.text]);
    } catch (err) {
      console.error('Transcription error:', err);
>>>>>>> parent of 1775e5e (THIS WORKS BRO)
    }
  };

  return (
    <div className="interview-container">
<<<<<<< HEAD
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
