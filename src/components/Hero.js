import React, { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';
import { handleConsultationClick } from '../utils/consultation';
import { HeroAnimation } from './hero/heroAnimation';
import { wordTransforms, headlineWords } from './hero/wordTransforms';

const Hero = () => {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const glitchCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const [textAnimated, setTextAnimated] = useState(false);
  const [hoveredWord, setHoveredWord] = useState(null);

  // Initialize Three.js animation
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;

    animationRef.current = new HeroAnimation(mountRef, mouseRef);
    animationRef.current.init();

    // Trigger text animation
    setTimeout(() => setTextAnimated(true), 100);

    return () => {
      if (animationRef.current) {
        animationRef.current.dispose();
      }
    };
  }, []);

  // Glitch effect for text
  useEffect(() => {
    if (typeof window === 'undefined' || !glitchCanvasRef.current) return;

    const glitchCanvas = glitchCanvasRef.current;
    const glitchCtx = glitchCanvas.getContext('2d');
    
    const setupGlitchCanvas = () => {
      glitchCanvas.width = window.innerWidth;
      glitchCanvas.height = window.innerHeight;
    };
    
    setupGlitchCanvas();
    window.addEventListener('resize', setupGlitchCanvas);

    let glitchAnimationId;
    let isGlitching = false;
    let currentWordElement = null;

    const createWordGlitchEffect = () => {
      if (!isGlitching || !currentWordElement) return;
      
      glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
      
      // Get word position and dimensions
      const rect = currentWordElement.getBoundingClientRect();
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + rect.height / 2;
      
      // Create brutalist glitch effects - more geometric and harsh
      for (let i = 0; i < 8; i++) {
        const offsetX = (Math.random() - 0.5) * 400;
        const offsetY = (Math.random() - 0.5) * 100;
        const x = wordCenterX + offsetX;
        const y = wordCenterY + offsetY;
        const width = Math.random() * 200 + 50;
        const height = Math.random() * 4 + 1; // Thinner, more precise lines
        const opacity = Math.random() * 0.6 + 0.2;
        
        // Sharper RGB channel separation
        glitchCtx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
        glitchCtx.fillRect(x - 3, y, width, height);
        
        glitchCtx.fillStyle = `rgba(0, 255, 0, ${opacity * 0.8})`;
        glitchCtx.fillRect(x, y, width, height);
        
        glitchCtx.fillStyle = `rgba(0, 0, 255, ${opacity * 0.6})`;
        glitchCtx.fillRect(x + 3, y, width, height);
      }
      
      // Add brutalist geometric artifacts
      for (let i = 0; i < 6; i++) {
        const x = wordCenterX + (Math.random() - 0.5) * 500;
        const y = wordCenterY + (Math.random() - 0.5) * 200;
        const size = Math.random() * 30 + 5;
        
        // Square artifacts instead of random shapes
        glitchCtx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3 + 0.1})`;
        glitchCtx.fillRect(x, y, size, size);
        
        // Add some outline squares
        glitchCtx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
        glitchCtx.lineWidth = 1;
        glitchCtx.strokeRect(x - 2, y - 2, size + 4, size + 4);
      }
      
      // More structured scan lines
      for (let y = rect.top - 50; y < rect.bottom + 50; y += 2) {
        if (Math.random() > 0.8) {
          const opacity = Math.random() * 0.15 + 0.05;
          glitchCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          glitchCtx.fillRect(rect.left - 150, y, rect.width + 300, 1);
        }
      }
      
      glitchAnimationId = requestAnimationFrame(createWordGlitchEffect);
    };

    // Expose glitch control functions
    window.startWordGlitch = (wordElement) => {
      currentWordElement = wordElement;
      isGlitching = true;
      glitchCanvas.style.opacity = '1';
      createWordGlitchEffect();
    };

    window.stopWordGlitch = () => {
      isGlitching = false;
      currentWordElement = null;
      glitchCanvas.style.opacity = '0';
      if (glitchAnimationId) {
        cancelAnimationFrame(glitchAnimationId);
      }
      glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
    };

    return () => {
      window.removeEventListener('resize', setupGlitchCanvas);
      if (glitchAnimationId) {
        cancelAnimationFrame(glitchAnimationId);
      }
      delete window.startWordGlitch;
      delete window.stopWordGlitch;
    };
  }, []);

  const handleWordMouseEnter = (index, event) => {
    setHoveredWord(index);
    if (window.startWordGlitch) {
      window.startWordGlitch(event.currentTarget);
    }
  };

  const handleWordMouseLeave = () => {
    setHoveredWord(null);
    if (window.stopWordGlitch) {
      window.stopWordGlitch();
    }
  };

  return (
    <section className={styles.hero}>
      <div ref={mountRef} className={styles.graphBackground} />
      <canvas ref={glitchCanvasRef} className={styles.glitchCanvas} />
      <div className={styles.content}>
        <h1 className={`${styles.headline} ${textAnimated ? styles.animated : ''}`}>
          {headlineWords.map((word, index) => (
            <span 
              key={index} 
              className={styles.word}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={(event) => handleWordMouseEnter(index, event)}
              onMouseLeave={handleWordMouseLeave}
            >
              <span 
                className={styles.wordInner}
                data-hover={wordTransforms[word]}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>
        <p className={`${styles.subheading} ${textAnimated ? styles.animated : ''}`}>
          Software systems and consultancy for scale, compliance, and custom needs.
        </p>
        <button 
          className={`${styles.ctaButton} ${textAnimated ? styles.animated : ''}`} 
          onClick={handleConsultationClick}
        >
            LET'S TALK
        </button>
      </div>
    </section>
  );
};

export default Hero;