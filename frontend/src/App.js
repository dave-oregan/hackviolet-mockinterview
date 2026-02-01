import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Component Imports
import Login from './components/Login';
import Home from './components/Home';
import Progress from './components/Progress';
import Survey from './components/Survey'; 
import Archive from './components/Archive';
import InterviewTechnical from './components/InterviewTechnical';
import InterviewBehavioral from './components/Interview-Behavioral'; 
import DotGrid from './components/Dotgrid';
import SplitText from './components/SplitText';
import FadeContent from './components/FadeContent';
import { getCurrentUser } from './functions/login';
function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className="App">
       {/* Landing Page Content */}
       <header className="App-header">
        <div className="header-content">
          <div className="background-dots" style={{ width: '100%', height: '100vh', position: 'absolute', zIndex: '0' }}>
            <DotGrid dotSize={5} gap={15} baseColor="#21242c" activeColor="#ffffff" proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
          </div>
          <div className="logo-section" style={{ zIndex: '1' }}>
            <SplitText text="Intervue" className="logo-text" delay={100} duration={0.8} />
            <p className="logo-tagline">AI-Powered Interview Coach</p>
          </div>
          <button className="login-nav-button" onClick={() => navigate('/login')} style={{ zIndex: '1' }}>Log In</button>
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        
        <Route path="/login" element={<FadeContent blur={true} duration={0.5}><Login /></FadeContent>} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/home" element={<Home />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/archive" element={<Archive />} />
        
        {/* The Route for the Interview */}
        <Route path="/interview-behavioral" element={<InterviewBehavioral />} />
        <Route path="/interview/technical" element={<InterviewTechnical />} />
      </Routes>
    </Router>
  );
}

export default App;