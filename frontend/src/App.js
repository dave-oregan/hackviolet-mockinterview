import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

// Component Imports
import Login from './components/Login';
import Home from './components/Home';
import Progress from './components/Progress';
import Survey from './components/Survey'; // [1] Import the Survey component
import DotGrid from './components/Dotgrid';
import SplitText from './components/SplitText';
import FadeContent from './components/FadeContent';
import InterviewBehavioral from './components/Interview-Behavioral';

// Helper Imports
import { getCurrentUser } from './functions/login';

// --- Landing Page Component ---
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
      <header className="App-header">
        <div className="header-content">
          {/* Background Animation */}
          <div className="background-dots" style={{ width: '100%', height: '100vh', position: 'absolute', zIndex: '0' }}>
            <DotGrid
              dotSize={5}
              gap={15}
              baseColor="#21242c"
              activeColor="#ffffff"
              proximity={120}
              shockRadius={250}
              shockStrength={5}
              resistance={750}
              returnDuration={1.5}
            />
          </div>

          {/* Foreground Content */}
          <div className="logo-section" style={{ zIndex: '1' }}>
            <SplitText 
              text="Intervue" 
              className="logo-text"
              delay={100}
              duration={0.8}
            />
            <p className="logo-tagline">AI-Powered Interview Coach</p>
          </div>
          
          <button className="login-nav-button" onClick={() => navigate('/login')} style={{ zIndex: '1' }}>
            Log In
          </button>
        </div>
      </header>
      <main className="App-main">
      </main>
    </div>
  );
}

// --- Main App Component (Routes) ---
function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<AppContent />} />
        
        {/* Login Page with Fade Transition */}
        <Route 
          path="/login" 
          element={
            <FadeContent blur={true} duration={0.5}>
              <Login />
            </FadeContent>
          } 
        />
        
        {/* New Survey Page Route */}
        <Route path="/survey" element={<Survey />} />

        {/* Home Dashboard */}
        <Route path="/home" element={<Home />} />
        
        {/* Progress / Bento Grid Page */}
        <Route path="/progress" element={<Progress />} />

        {/* Interview Screen 1 */}
        <Route path="/interview-behavioral" element={<InterviewBehavioral />} />
      </Routes>
    </Router>
  );
}

export default App;