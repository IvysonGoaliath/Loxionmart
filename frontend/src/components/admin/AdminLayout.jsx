import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Store, ShoppingBag, Calendar,
  TrendingUp, Users, LogOut, ChevronRight, Menu, ClipboardCheck
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import styles from './AdminLayout.module.css'

const NAV = [
  { to: '/admin',              label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Shop applications', icon: ClipboardCheck },
  { to: '/admin/businesses',   label: 'Businesses',  icon: Store },
  { to: '/admin/orders',       label: 'Orders',      icon: ShoppingBag },
  { to: '/admin/bookings',     label: 'Bookings',    icon: Calendar },
  { to: '/admin/commissions',  label: 'Commissions', icon: TrendingUp },
  { to: '/admin/users',        label: 'Users',       icon: Users },
]

function AdminNav() {
  return <nav className={styles.nav} aria-label="Administration">
    {NAV.map(({ to, label, icon: Icon, end }) => (
      <NavLink key={to} to={to} end={end}
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}>
        <Icon size={17} /><span>{label}</span><ChevronRight size={13} className={styles.chevron} />
      </NavLink>
    ))}
  </nav>
}

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <img src="/logo.png" alt="Loxion Mart" className={styles.brandLogo} />
            <span className={styles.brandTag}>Admin</span>
          </div>

          <AdminNav />
        </div>

        <div className={styles.sideBot}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className={styles.adminName}>{user?.full_name}</div>
              <div className={styles.adminRole}>Administrator</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <Link to="/admin" className={styles.mobileBrand}>Mall admin</Link>
        <Link to="/admin/applications" className={styles.reviewLink}>Shop applications</Link>
        <details key={location.pathname} className={styles.mobileMenu}>
          <summary><Menu size={19} /><span>Menu</span></summary>
          <div className={styles.mobileDropdown}>
            <AdminNav />
            <Link to="/" className={styles.navItem}>Back to the mall</Link>
            <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={15} />Sign out</button>
          </div>
        </details>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
