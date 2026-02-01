import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../css/CompanySelection.css';

// Asset Imports
import metaLogo from '../assets/meta.png';
import appleLogo from '../assets/apple.png';
import amazonLogo from '../assets/amazon.png';
import netflixLogo from '../assets/netflix.png';
import googleLogo from '../assets/google.png';

// --- Constants ---
const COMPANIES = [
  { id: 'meta', name: 'Meta', logo: metaLogo },
  { id: 'apple', name: 'Apple', logo: appleLogo },
  { id: 'amazon', name: 'Amazon', logo: amazonLogo },
  { id: 'netflix', name: 'Netflix', logo: netflixLogo },
  { id: 'google', name: 'Google', logo: googleLogo },
];

const STEPS = {
  COMPANY: 'company',
  TYPE: 'type',
  DIFFICULTY: 'difficulty',
};

const CompanySelection = ({ onClose, onSelect }) => {
  const [step, setStep] = useState(STEPS.COMPANY);
  const [selection, setSelection] = useState({
    company: null,
    type: null,
    difficulty: null,
  });

  // --- Handlers ---
  const handleCompanySelect = (companyName) => {
    setSelection((prev) => ({ ...prev, company: companyName }));
    setStep(STEPS.TYPE);
    let capName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    localStorage.setItem("company-key", capName)
  };

  const handleTypeSelect = (type) => {
    setSelection((prev) => ({ ...prev, type }));
    setStep(STEPS.DIFFICULTY);
  };

  const handleDifficultySelect = (difficulty) => {
    const finalData = { ...selection, difficulty };
    onSelect(finalData); 
  };

  const handleBack = () => {
    if (step === STEPS.DIFFICULTY) setStep(STEPS.TYPE);
    else if (step === STEPS.TYPE) setStep(STEPS.COMPANY);
  };

  // --- Render Helpers ---
  
  // 1. Company List View
  const renderCompanyList = () => (
    <>
      <h2 className="selection-title">Select Target Company</h2>
      <p className="selection-subtitle">Choose a company to begin your tailored interview session.</p>

      <section className="liquid-scroll-container">
        <div className="scroll-content">
          {COMPANIES.map((company) => (
            <motion.div 
              key={company.id}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="company-glass-card"
              onClick={() => handleCompanySelect(company.name)}
            >
              <div className="logo-wrapper">
                <img src={company.logo} alt={`${company.name} Logo`} />
              </div>
              <span className="company-name">{company.name}</span>
              <span className="arrow-icon">→</span>
            </motion.div>
          ))}
          {/* Spacer to allow scrolling past the blur */}
          <div style={{ height: '25px', flexShrink: 0 }}></div>
        </div>
        
      </section>

      {/* General Interview Tab */}
      <div className="general-section">
        <div className="divider-line"><span>OR</span></div>
        <motion.div 
            whileHover={{ scale: 1.02, backgroundColor: "rgba(97, 218, 251, 0.15)", borderColor: "#61dafb" }}
            whileTap={{ scale: 0.98 }}
            className="company-glass-card general-card"
            onClick={() => handleCompanySelect('General')}
        >
            <div className="logo-wrapper general-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            
            <div className="general-text-wrapper">
                {/* [FIX] Used specific class 'general-title' to avoid margin conflict */}
                <span className="general-title">General Interview</span>
                <span className="general-subtext">Practice standard industry questions</span>
            </div>
            
            <span className="arrow-icon">→</span>
        </motion.div>
      </div>
    </>
  );

  // 2. Interview Type View
  const renderTypeSelection = () => (
    <div className="step-container">
      <h2 className="selection-title">Interview Type</h2>
      <p className="selection-subtitle">What kind of questions should we ask for <strong>{selection.company}</strong>?</p>
      
      <div className="options-grid">
        {['Behavioral', 'Technical'].map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05, borderColor: "rgba(97, 218, 251, 0.6)", backgroundColor: "rgba(97, 218, 251, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="option-card glass-panel"
            onClick={() => handleTypeSelect(type)}
          >
            <span className="option-title">{type}</span>
            <span className="option-desc">
              {type === 'Behavioral' ? 'Leadership, culture fit, and soft skills.' : 'Coding challenges, system design, and technical concepts.'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  // 3. Difficulty View
  const renderDifficultySelection = () => (
    <div className="step-container">
      <h2 className="selection-title">Select Difficulty</h2>
      <p className="selection-subtitle">Set the challenge level for your <strong>{selection.type}</strong> interview.</p>
      
      <div className="options-vertical">
        {['Easy', 'Medium', 'Hard'].map((diff) => (
          <motion.button
            key={diff}
            whileHover={{ scale: 1.02, x: 10, borderColor: diff === 'Hard' ? '#f87171' : diff === 'Medium' ? '#facc15' : '#4ade80' }}
            whileTap={{ scale: 0.98 }}
            className={`option-row glass-panel ${diff.toLowerCase()}`}
            onClick={() => handleDifficultySelect(diff)}
          >
            <span className="option-name">{diff}</span>
            <span className="arrow-icon">→</span>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="company-selection-overlay"
    >
      {/* Top Controls */}
      <div className="overlay-controls">
        {step !== STEPS.COMPANY && (
          <button className="back-btn-small" onClick={handleBack}>← Back</button>
        )}
        <button className="close-btn-small" onClick={onClose}>✕</button>
      </div>
      
      <div className="selection-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {step === STEPS.COMPANY && renderCompanyList()}
            {step === STEPS.TYPE && renderTypeSelection()}
            {step === STEPS.DIFFICULTY && renderDifficultySelection()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CompanySelection;