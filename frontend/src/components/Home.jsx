import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { logoutUser } from '../functions/login';
import { AnimatePresence } from 'framer-motion';

// Components
import SelectMode from './SelectMode';
import CompanySelection from './CompanySelection'; 
import FadeContent from './FadeContent'; 
import GlassIcons from './GlassIcon';
import LightPillar from './LightPillar';

// SVG Icons
import TelOut from '../svg/telout';
import Graph from '../svg/graph';
import ArchiveIcon from '../svg/archive';

// Styles
import '../css/Home.css';

function Home() {
  const navigate = useNavigate();

  // 🔐 Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI state
  const [showCompanySelect, setShowCompanySelect] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // 🔐 Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: localStorage.getItem('name'), // replace with Firestore later
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔒 Protect route AFTER auth finishes loading
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 🚪 Logout
  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // 🧩 Interview flow
  const handleJoin = () => {
    setShowCompanySelect(true);
  };

  const handleCompanySelected = (finalData) => {
    setShowCompanySelect(false);

    if (finalData.type === 'Behavioral') {
      navigate('/interview-behavioral', { 
        state: { 
          company: finalData.company,
          difficulty: finalData.difficulty 
        } 
      });
    } else if (finalData.type === 'Technical') {
      navigate('/interview/technical', { 
        state: { 
          company: finalData.company,
          difficulty: finalData.difficulty 
        } 
      });
    } else {
      console.warn('Unknown interview type selected');
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setShowCompanySelect(false);
  };

  const handleSelect = (mode) => {
    console.log('Selected mode:', mode);
  };

  // ⏳ Prevent render flicker
  if (authLoading) return null;
  if (!user) return null;

  // Menu Items
  const items = [
    { 
      icon: <TelOut />, 
      color: 'blue', 
      label: 'New Interview', 
      click: handleJoin 
    },
    { 
      icon: <Graph />, 
      color: 'purple', 
      label: 'Progress', 
      click: () => navigate('/progress') 
    },
    { 
      icon: <ArchiveIcon />, 
      color: 'indigo', 
      label: 'Archive', 
      click: () => navigate('/archive') 
    },
  ];

  return (
    <FadeContent blur={true} duration={0.8}>
      <div className="home-container">

        {/* Background */}
        <LightPillar 
          topColor="#5227FF" 
          bottomColor="#FF9FFC" 
          intensity={1} 
          rotationSpeed={0.3} 
          glowAmount={0.002} 
          pillarWidth={3} 
          pillarHeight={0.4} 
          noiseIntensity={0.5} 
          pillarRotation={25} 
          interactive={false} 
          mixBlendMode="screen" 
          quality="high"
        />

        {/* Header */}
        <header className="home-header">
          <h1 className="home-logo">Intervue</h1>
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </header>

        {/* Main */}
        <main className="home-main">
          <div className="welcome-top">
            <h2 className="welcome-text">Welcome, {user.name}</h2>
          </div>

          <div className="glass-container" style={{ width: '100vw' }}>
            <GlassIcons items={items} colorful={false} />
          </div>

          <div className="spacer" style={{ height: '15vh' }} />
        </main>

        {/* Overlays */}
        <AnimatePresence>
          {showCompanySelect && (
            <CompanySelection 
              onClose={() => setShowCompanySelect(false)} 
              onSelect={handleCompanySelected} 
            />
          )}
        </AnimatePresence>

        {/* Legacy Modal */}
        <SelectMode 
          open={openModal} 
          onClose={handleClose} 
          onSelect={handleSelect} 
        />

      </div>
    </FadeContent>
  );
}

export default Home;
