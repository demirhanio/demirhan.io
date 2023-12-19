
import React from 'react';
import FullscreenVideo from '../components/FullscreenVideo';
import styles from './pageStyles.module.css';

const Home = () => {
  return (
    <div className={styles.wrapper}>
      <FullscreenVideo videoSrc="/video.mp4" />
    </div>
  );
};

export default Home;
