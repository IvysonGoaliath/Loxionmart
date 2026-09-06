import styles from './BrandLogo.module.css'
export default function BrandLogo({ className = '' }) {
  return <span className={`${styles.frame} ${className}`}><img src="/logo.png" alt="Loxion Mart" className={styles.image} /></span>
}
