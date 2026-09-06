import BrandLogo from './BrandLogo'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore()
  const count = useCartStore(s => s.count())
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false) }
  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <BrandLogo />
        </Link>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive('/') ? styles.active : ''}`}>Home</Link>
          <Link to="/browse" className={`${styles.link} ${isActive('/browse') ? styles.active : ''}`}>Browse</Link>
          {isAdmin() && (
            <Link to="/admin" className={`${styles.link} ${styles.adminLink}`}>
              <Settings size={13} /> Admin
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartBtn} aria-label={`Shopping cart, ${count} items`}>
            <ShoppingCart size={20} />
            {count > 0 && <span className={styles.cartBadge}>{count}</span>}
          </Link>

          {user ? (
            <details className={styles.userMenu}>
              <summary className={styles.userBtn} aria-label="Account menu">
                <User size={15} />
                <span className="hide-mobile">{user.full_name.split(' ')[0]}</span>
              </summary>
              <div className={styles.dropdown}>
                <Link to="/my-orders"   className={styles.dropItem}>My Orders</Link>
                <Link to="/my-bookings" className={styles.dropItem}>My Bookings</Link>
                <Link to="/profile"     className={styles.dropItem}>Profile</Link>
                <div className={styles.dropDivider} />
                <button onClick={handleLogout} className={`${styles.dropItem} ${styles.dropLogout}`}>
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </details>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"    className="btn btn-ghost btn-sm hide-mobile">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join free</Link>
            </div>
          )}

          <button aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/"       className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/browse" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Browse</Link>
          {isAdmin() && <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin</Link>}
          {user ? (
            <>
              <Link to="/my-orders"   className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/my-bookings" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Bookings</Link>
              <button onClick={handleLogout} className={`${styles.mobileLink} ${styles.mobileLogout}`}>Sign out</button>
            </>
          ) : (
            <div className={styles.mobileAuth}>
              <Link to="/login"    className="btn btn-secondary btn-full" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-full"   onClick={() => setMenuOpen(false)}>Join free</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
