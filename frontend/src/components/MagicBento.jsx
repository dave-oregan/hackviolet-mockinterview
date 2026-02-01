import React, { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import '../css/MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 400; 
const DEFAULT_GLOW_COLOR = '132, 0, 255'; // Purple theme
const MOBILE_BREAKPOINT = 768;

// --- Custom Components for Card Content ---

const PerformanceChart = () => {
  // Mock Data: 7 days of interview scores
  const data = [65, 72, 68, 85, 82, 90, 88];
  const max = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  // Gradient fill area
  const fillPoints = `0,100 ${points} 100,100`;

  // [1] Refs for animation
  const lineRef = useRef(null);
  const containerRef = useRef(null);

  // [2] Animation Handler
  const handleMouseEnter = () => {
    if (lineRef.current) {
      const length = lineRef.current.getTotalLength();
      
      // Reset to "undrawn" state (offset = length) then animate to 0
      gsap.fromTo(
        lineRef.current,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }
      );
    }
  };

  // Ensure line is visible on initial load without animation (optional)
  useEffect(() => {
    if (lineRef.current) {
       const length = lineRef.current.getTotalLength();
       gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: 0 });
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter} // [3] Trigger animation on hover
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '20px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff' }}>+12%</span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Weekly Growth</span>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#a78bfa' }}>88.0</span>
           <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Avg Score</span>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative', minHeight: '100px' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(132, 0, 255, 0.5)" />
              <stop offset="100%" stopColor="rgba(132, 0, 255, 0)" />
            </linearGradient>
          </defs>
          
          {/* Grid Lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />

          {/* Area Fill */}
          <polygon points={fillPoints} fill="url(#chartGradient)" />

          {/* Line Path with Ref */}
          <polyline 
            ref={lineRef} // [4] Attach ref
            points={points} 
            fill="none" 
            stroke="#8400ff" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            vectorEffect="non-scaling-stroke"
          />

          {/* Data Points */}
          {data.map((val, i) => {
             const x = (i / (data.length - 1)) * 100;
             const y = 100 - (val / max) * 100;
             return (
               <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" />
             );
          })}
        </svg>
      </div>
    </div>
  );
};

const HistoryList = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
    {[
      { company: 'Goldman Sachs', type: 'Behavioral', score: 85, date: '2h ago' },
      { company: 'Google', type: 'Technical', score: 72, date: 'Yesterday' },
      { company: 'Amazon', type: 'Leadership', score: 91, date: '2 days ago' },
      { company: 'Meta', type: 'Behavioral', score: 78, date: '3 days ago' },
      { company: 'General Interview', type: 'Technical', score: 82, date: '6 days ago' },

    ].map((item, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: '500' }}>{item.company}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{item.type}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ color: item.score >= 80 ? '#4ade80' : '#fbbf24', fontWeight: '600' }}>{item.score}%</div>
           <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{item.date}</div>
        </div>
      </div>
    ))}
  </div>
);

const ResourceList = () => (
  <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {['STAR Method Guide', '50 Common SQL Qs', 'Body Language 101'].map((item, i) => (
      <li key={i} style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '8px 12px', 
        borderRadius: '8px', 
        fontSize: '0.8rem', 
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8400ff' }}></span>
        {item}
      </li>
    ))}
  </ul>
);

const SettingsPreview = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '5px' }}>
     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Difficulty</div>
        <div style={{ color: '#fff', fontWeight: '600', marginTop: '4px' }}>Expert</div>
     </div>
     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Focus</div>
        <div style={{ color: '#fff', fontWeight: '600', marginTop: '4px' }}>Finance</div>
     </div>
  </div>
);

// --- Data Configuration ---

// Data ordered specifically to fit the CSS Grid Layout (Hero -> Tall -> Standard -> Wide)
const cardData = [
  // 1. Big Feature Card (2x2) - Performance Overview
  {
    color: '#0a0a0a',
    title: 'Performance',
    label: 'Analytics',
    renderContent: () => <PerformanceChart />
  },
  // 2. Tall Side Card (1x2) - History Timeline
  {
    color: '#0a0a0a',
    title: 'Recent Activity',
    label: 'History',
    renderContent: () => <HistoryList />
  },
  // 3. Standard Card (1x1) - Immediate Action
  {
    color: '#0a0a0a',
    title: 'New Session',
    label: 'Action',
    description: 'Start a new mock interview. Choose from Behavioral or Technical tracks.'
  },
  // 4. Standard Card (1x1) - Learning
  {
    color: '#0a0a0a',
    title: 'Resources',
    label: 'Library',
    renderContent: () => <ResourceList />
  },
  // 5. Standard Card (1x1) - Feedback
  {
    color: '#0a0a0a',
    title: 'Coach Insights',
    label: 'Feedback',
    description: '"Your pacing has improved. Try to reduce filler words like \'um\' during technical explanations."'
  },
  // 6. Wide Card (2x1) - System/Settings
  {
    color: '#0a0a0a',
    title: 'Preferences',
    label: 'System',
    renderContent: () => <SettingsPreview />
  }
];

// --- Helper Functions ---

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

// --- Components ---

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 3, // Reduced tilt for subtler effect
          rotateY: 3,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -5; // Reduced multiplier
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.02; // Reduced magnetism
        const magnetY = (y - centerY) * 0.02;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = e => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(card => card.style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance) glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);

        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, { opacity: targetOpacity, duration: targetOpacity > 0 ? 0.2 : 0.5, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => card.style.setProperty('--glow-intensity', '0'));
      if (spotlightRef.current) gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

const MagicBento = ({
  textAutoHide = true, // Set to false if you always want text visible
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const baseClassName = `magic-bento-card ${textAutoHide ? 'magic-bento-card--text-autohide' : ''} ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;
          const cardProps = {
            className: baseClassName,
            style: {
              backgroundColor: card.color,
              '--glow-color': glowColor
            }
          };

          // Wrap every card in ParticleCard for consistency, or conditionally if you only want some to sparkle
          return (
            <ParticleCard
              key={index}
              {...cardProps}
              disableAnimations={shouldDisableAnimations}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <div className="magic-bento-card__header">
                <div className="magic-bento-card__label">{card.label}</div>
              </div>
              <div className="magic-bento-card__content" style={{ height: '100%' }}>
                <h2 className="magic-bento-card__title">{card.title}</h2>
                {card.renderContent ? (
                  card.renderContent()
                ) : (
                  <p className="magic-bento-card__description">{card.description}</p>
                )}
              </div>
            </ParticleCard>
          );
        })}
      </BentoCardGrid>
    </>
  );
};

export default MagicBento;