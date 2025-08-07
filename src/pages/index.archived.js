import React from 'react';
import FullscreenVideo from '../components/FullscreenVideo';
import styles from './pageStyles.module.css';
const Home = () => {
  return (
    <div className={styles.wrapper}>
      <FullscreenVideo videoSrc="/video.webm" />
    </div>
  );
};
export default Home;