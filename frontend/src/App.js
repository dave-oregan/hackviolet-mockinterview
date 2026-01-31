import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Home from './components/Home';
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
          <div className="logo-section">
            <h1 className="logo-text">Intervue</h1>
            <p className="logo-tagline">AI-Powered Interview Coach</p>
          </div>
          <button className="login-nav-button" onClick={() => navigate('/login')}>
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
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
