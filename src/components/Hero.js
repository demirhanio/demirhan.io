import React, { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';
import { handleConsultationClick } from '../utils/consultation';
import { HeroAnimation } from './hero/heroAnimation';
import { wordTransforms, headlineWords } from './hero/wordTransforms';
const Hero = () => {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const [textAnimated, setTextAnimated] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;
    animationRef.current = new HeroAnimation(mountRef, mouseRef);
    animationRef.current.init();
    
    setTimeout(() => setTextAnimated(true), 100);
    return () => {
      if (animationRef.current) {
        animationRef.current.dispose();
      }
    };
  }, []);
  return (
    <section className={styles.hero}>
      <div ref={mountRef} className={styles.graphBackground} />
      <div className={styles.content}>
        <h1 className={`${styles.headline} ${textAnimated ? styles.animated : ''}`}>
          {headlineWords.map((word, index) => (
            <span 
              key={index} 
              className={styles.word}
              style={{ animationDelay: `${index * 0.1}s` }}
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
            LET&apos;S TALK
        </button>
      </div>
    </section>
  );
};
export default Hero;