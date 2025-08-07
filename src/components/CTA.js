import React from 'react';
import styles from './CTA.module.css';
import { handleConsultationClick } from '../utils/consultation';
const CTA = () => {
  return (
    <section id="contact" className={styles.cta}>
      <div className={styles.container}>
        <h2 className={styles.headline}>
          BUILD. DELIVER.<br />
          SCALE.
        </h2>
        <button className={styles.ctaButton} onClick={handleConsultationClick}>
          INITIATE PROJECT
        </button>
      </div>
    </section>
  );
};
export default CTA;