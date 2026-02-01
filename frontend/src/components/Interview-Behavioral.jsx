import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, ArrowLeft } from 'lucide-react';
import '../css/InterviewBehavioral.css';

import MicIcon from '../svg/mic';
import MicwIcon from '../svg/micw';

function InterviewBehavioral() {
  const navigate = useNavigate();
  
  // --- States ---
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello. I'm Marcus, Senior VP at Goldman Sachs. Let's start. Please introduce yourself." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // --- Refs ---
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef(null);
  const interviewStartRef = useRef(null);
  const responseStartRef = useRef(null);

  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: { echoCancellation: true } 
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;
      interviewStartRef.current = Date.now();

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      detectAudioLevel();

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const responseEndTime = Date.now();
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        handleAudioSubmit(audioBlob, responseStartRef.current, responseEndTime);
      };

      mediaRecorderRef.current = recorder;
      setIsInterviewStarted(true);

      await fetch('http://localhost:5000/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: "Goldman Sachs" })
      });

    } catch (err) {
      console.error("Initialization error:", err);
      alert("Mic and Camera access are required.");
    }
  };

  const detectAudioLevel = () => {
    if (!analyserRef.current) return;
    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(array);
    const avg = array.reduce((a, b) => a + b) / array.length;
    setMicLevel(Math.floor(avg));
    requestAnimationFrame(detectAudioLevel);
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      audioChunksRef.current = [];
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
    } catch (e) {
      console.error("Audio error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await response.json();
      processResponse(data);
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setIsLoading(false);
    }
  };

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
      audio.play().catch(e => console.error("Playback error:", e));
    }
  };

  return (
    <div className="interview-container bg-black min-h-screen text-white relative">
      {!isInterviewStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <button className="px-8 py-4 bg-cyan-600 rounded-full font-bold hover:bg-cyan-500 transition-all" onClick={startInterview}>
            Start Interview
          </button>
        </div>
      )}

      <header className="p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-20">
         <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10" onClick={() => navigate('/')}>
           <ArrowLeft size={16} /> Exit
         </button>
         <span className="font-mono tracking-widest text-cyan-400">GOLDMAN SACHS VIRTUAL PANEL</span>
         <button className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-full hover:bg-red-500/20" onClick={() => navigate('/')}>
           End Meeting
         </button>
      </header>

      <main className="p-6 flex gap-6 h-[calc(100vh-180px)]">
        <div className="w-1/2 flex flex-col gap-4">
           <div className={`flex-1 bg-white/5 border border-white/10 rounded-3xl relative flex items-center justify-center transition-all ${isAiSpeaking ? 'ring-2 ring-cyan-500' : ''}`}>
             <div className="text-gray-500 uppercase tracking-widest">Marcus (AI)</div>
           </div>
           
           <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
             <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
             <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs">
               You (Vol: {micLevel})
             </div>
           </div>
        </div>

        <div className="w-1/2 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {messages.map((m, i) => (
               <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                 <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{m.role}</span>
                 <div className={`p-4 rounded-2xl max-w-[90%] border ${m.role === 'user' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-black/40 border-white/10'}`}>
                   {m.text}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      <footer className="p-6 flex items-center justify-center gap-4 fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10">
        <button className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-500' : 'bg-white/10'}`} onClick={toggleRecording} disabled={isLoading}>
          {isRecording ? <Square size={24} fill="white" /> : <Mic size={24} />}
        </button>

        <form className="flex-1 max-w-2xl flex gap-2" onSubmit={handleTextSubmit}>
          <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 outline-none focus:border-cyan-500 transition-all" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type a message..."} 
            disabled={isLoading || isRecording}
          />
        </form>
      </footer>
    </div>
  );
}

export default InterviewBehavioral;