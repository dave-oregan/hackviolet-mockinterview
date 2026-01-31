import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FadeContent from './FadeContent';
import '../css/Archive.css';

// Mock Data for Recordings
const MOCK_RECORDINGS = [
  {
    id: 1,
    date: '2025-11-12',
    type: 'Behavioral',
    duration: '15:42',
    score: 85,
    title: 'Leadership Principles',
    tags: ['Amazon', 'Leadership']
  },
  {
    id: 2,
    date: '2025-11-10',
    type: 'Technical',
    duration: '22:15',
    score: 72,
    title: 'System Design: URL Shortener',
    tags: ['System Design', 'Backend']
  },
  {
    id: 3,
    date: '2025-11-05',
    type: 'Behavioral',
    duration: '10:05',
    score: 92,
    title: 'Tell me about a time...',
    tags: ['General', 'Soft Skills']
  },
  {
    id: 4,
    date: '2025-10-28',
    type: 'Technical',
    duration: '30:00',
    score: 65,
    title: 'LeetCode Hard: Graphs',
    tags: ['Google', 'Algorithms']
  },
  {
    id: 5,
    date: '2025-10-15',
    type: 'Behavioral',
    duration: '12:30',
    score: 88,
    title: 'Conflict Resolution',
    tags: ['Teamwork']
  }
];

const Archive = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'score' | 'duration'

  // Sorting Logic
  const sortedRecordings = useMemo(() => {
    const data = [...MOCK_RECORDINGS];
    switch (sortBy) {
      case 'date':
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'score':
        return data.sort((a, b) => b.score - a.score);
      case 'duration':
        return data.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
      default:
        return data;
    }
  }, [sortBy]);

  return (
    <FadeContent blur={true} duration={0.6}>
      <div className="archive-container">
        
        {/* Header */}
        <header className="archive-header">
          <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
          <h1>Interview Archive</h1>
          
          <div className="sort-controls">
            <span>Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Date (Newest)</option>
              <option value="score">Score (High to Low)</option>
              <option value="duration">Duration (Longest)</option>
            </select>
          </div>
        </header>

        {/* Horizontal Scroll List */}
        <div className="recordings-scroll-wrapper">
          <motion.div className="recordings-track">
            <AnimatePresence>
              {sortedRecordings.map((rec) => (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="recording-card glass-panel"
                >
                  <div className="card-top">
                    <span className={`type-badge ${rec.type.toLowerCase()}`}>{rec.type}</span>
                    <span className="date-label">{rec.date}</span>
                  </div>

                  <div className="card-main">
                    <h3>{rec.title}</h3>
                    <div className="score-circle" style={{ 
                      borderColor: rec.score >= 80 ? '#4ade80' : rec.score >= 60 ? '#facc15' : '#f87171' 
                    }}>
                      <span className="score-num">{rec.score}</span>
                      <span className="score-label">Score</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="tags">
                      {rec.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                    </div>
                    <div className="meta-info">
                      <span>⏱ {rec.duration}</span>
                    </div>
                    <button className="play-btn">▶ Watch</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </FadeContent>
  );
};

export default Archive;