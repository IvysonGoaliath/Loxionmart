import BrandLogo from './BrandLogo'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <BrandLogo />
          <p className={styles.sub}>Supporting local businesses across Mzansi.</p>
        </div>
        <div className={styles.col}>
          <div className={styles.colTitle}>Browse</div>
          <Link to="/browse?cat=hair_beauty"   className={styles.colLink}>Hair & Beauty</Link>
          <Link to="/browse?cat=phones_tech"   className={styles.colLink}>Phones & Tech</Link>
          <Link to="/browse?cat=food_catering" className={styles.colLink}>Food & Catering</Link>
          <Link to="/browse?cat=home_services" className={styles.colLink}>Home Services</Link>
        </div>
        <div className={styles.col}>
          <div className={styles.colTitle}>Account</div>
          <Link to="/login"        className={styles.colLink}>Sign in</Link>
          <Link to="/register"     className={styles.colLink}>Join free</Link>
          <Link to="/my-orders"    className={styles.colLink}>My Orders</Link>
          <Link to="/my-bookings"  className={styles.colLink}>My Bookings</Link>
        </div>
        <div className={styles.col}>
          <div className={styles.colTitle}>Business</div>
          <Link to="/browse" className={styles.colLink}>Discover businesses</Link>
          <a href="/#how-it-works" className={styles.colLink}>How it works</a>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} Loxion Mart · Shop Local, Shop Lekker 🇿🇦</span>
          <span className={styles.bottomRight}>
            Made for the neighbourhood.
          </span>
        </div>
      </div>
    </footer>
  )
}
