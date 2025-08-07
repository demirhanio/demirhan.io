import React from 'react';
import styles from './Header.module.css';
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          DEMİRHAN
        </div>
        <nav className={styles.nav}>
          <a href="#services" className={styles.navLink}>SERVICES</a>
          <a href="#contact" className={styles.navLink}>CONTACT</a>
        </nav>
      </div>
    </header>
  );
};
export default Header;