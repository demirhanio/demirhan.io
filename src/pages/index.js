import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import CTA from '../components/CTA';
import styles from './index.module.css';
const Home = () => {
  return (
    <main className={styles.main}>
      <Hero />
      <Services />
      <CTA />
    </main>
  );
};
export default Home;
