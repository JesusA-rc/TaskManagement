import React from 'react'
import dashboard from '../../assets/dashboard.png'
import board from '../../assets/board.png'
import analitycs from '../../assets/analitycs.png'
import { NavLink } from 'react-router-dom';
import styles from './SidebarNav.module.css'

const SidebarNav = () => {
  return (
    <div className={styles.sidebarNav}>
      <div className={styles.sidebarNavLinks}>
        <NavLink to="/TrackerTime" className={({ isActive }) => (isActive ? `${styles.enlace} ${styles.active_link}` : styles.enlace)}>
          <img src={dashboard} alt="dashboard" className={styles.sidebarNav_img} />
          <p className={styles.p_description}>Tracker time</p>
        </NavLink>
      </div>
      <div className={styles.sidebarNavLinks}>
        <NavLink to="/board" className={({ isActive }) => (isActive ? `${styles.enlace} ${styles.active_link}` : styles.enlace)}>
          <img src={board} alt="board" className={styles.sidebarNav_img} />
          <p className={styles.p_description}>Board</p>
        </NavLink>
      </div>
      <div className={styles.sidebarNavLinks}>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? `${styles.enlace} ${styles.active_link}` : styles.enlace)}>
          <img src={analitycs} alt="analytics" className={styles.sidebarNav_img} />
          <p className={styles.p_description}>Analytics</p>
        </NavLink>
      </div>
    </div>
  );
};


export default SidebarNav