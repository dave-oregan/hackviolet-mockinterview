import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const SplitText = ({
  text = "",
  className = "",
  delay = 50,
  duration = 0.5,
  ease = "power3.out",
  textAlign = "center"
}) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Create the animation for each character
      gsap.from(".split-char", {
        opacity: 0,
        y: 40,
        duration: duration,
        ease: ease,
        stagger: delay / 1000, // convert ms to s
      });
    }, containerRef);

    return () => ctx.revert(); // cleanup
  }, [delay, duration, ease]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ textAlign, overflow: 'hidden', display: 'inline-block' }}
    >
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="split-char"
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default SplitText;