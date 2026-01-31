import React, { useRef } from 'react'; // [1] Import useRef
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap'; // [2] Import GSAP
import MagicBento from './MagicBento';
import FadeContent from './FadeContent';
import '../css/MagicBento.css';

const Progress = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null); // [3] Create ref for the container

  const handleBack = () => {
    // [4] The Exit Animation
    gsap.to(containerRef.current, {
      opacity: 0,
      y: 20, // Slide down slightly
      scale: 0.98, // Slight shrink effect
      filter: 'blur(10px)', // Add blur
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        navigate('/home'); // Navigate ONLY after animation finishes
      }
    });
  };

  return (
    <FadeContent blur={true} duration={0.6}>
      {/* [5] Attach the ref here */}
      <div className="progress-page-container" ref={containerRef}>
        <header className="glass-header">
          <div className="header-left">
            <button 
              className="back-button" 
              onClick={handleBack} // [6] Use the custom handler
              aria-label="Back to Home"
            >
              ←
            </button>
            <span className="page-title">Dashboard</span>
          </div>
          <div className="header-right">
          </div>
        </header>

        <main>
          <MagicBento />
        </main>
      </div>
    </FadeContent>
  );
};

export default Progress;