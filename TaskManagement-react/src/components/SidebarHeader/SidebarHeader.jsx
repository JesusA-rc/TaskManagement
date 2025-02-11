import React from 'react'
import styles from './SidebarHeader.module.css'

const SidebarHeader = () => {
  return (
    <div className={styles.sidebarHeader}>
        <img src="https://img.freepik.com/vector-gratis/circulo-azul-usuario-blanco_78370-4707.jpg" alt="" className={styles.logo_img} />
        <p className={styles.nombre_logo}>Management</p>
    </div>
  )
}

export default SidebarHeader