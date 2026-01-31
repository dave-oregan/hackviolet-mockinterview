import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const FadeContent = ({ 
  children, 
  blur = false, 
  duration = 0.8, 
  delay = 0, 
  threshold = 0.1, 
  initialOpacity = 0, 
  className = "" 
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    gsap.fromTo(element, 
      { opacity: initialOpacity, filter: blur ? 'blur(10px)' : 'none', y: 10 },
      { 
        opacity: 1, 
        filter: 'blur(0px)', 
        y: 0,
        duration, 
        delay, 
        ease: 'power2.out' 
      }
    );
  }, [blur, duration, delay, initialOpacity]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default FadeContent;