import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
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
      <header className="App-header">
        <div className="header-content">
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route 
          path="/login" 
          element={
            <FadeContent blur={true} duration={0.5}>
              <Login />
            </FadeContent>
          } 
        />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;