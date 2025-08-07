import React from 'react';
import styles from './FullscreenVideo.module.css';
const FullscreenVideo = ({ videoSrc }) => {
  return (
    <video className={styles.fullscreenVideo} autoPlay loop muted>
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};
export default FullscreenVideo;
