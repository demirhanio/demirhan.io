import React from 'react';
import styles from './Services.module.css';
import { handleConsultationClick } from '../utils/consultation';
const services = [
  {
    id: 1,
    title: 'VERTICAL SOCIAL E-COMMERCE',
    description: 'Custom social commerce platforms built for community-driven sales and engagement.',
    number: '01'
  },
  {
    id: 2,
    title: 'E-COMMERCE INFRASTRUCTURE',
    description: 'Cart systems, social communities, marketplaces, and fulfillment tools.',
    number: '02'
  },
  {
    id: 3,
    title: 'FINANCIAL AUTOMATIONS',
    description: 'ERP workflows and AI-backed accounting integrations for seamless operations.',
    number: '03'
  },
  {
    id: 4,
    title: 'BROKERAGE TERMINALS',
    description: 'Real-time dashboards, trade tools, and on-chain workflows.',
    number: '04'
  }
];
const Services = () => {
  return (
    <section id="services" className={styles.services}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>LET&apos;S TALK ABOUT</h2>
          <div className={styles.titleLine}></div>
        </div>
        <div className={styles.servicesList}>
          {services.map((service) => (
            <div key={service.id} className={styles.serviceRow} onClick={handleConsultationClick}>
              <div className={styles.serviceNumber}>{service.number}</div>
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
                <p className={styles.serviceDescription}>{service.description}</p>
              </div>
              <div className={styles.serviceArrow} onClick={handleConsultationClick}>→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Services;