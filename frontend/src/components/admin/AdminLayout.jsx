import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Store, ShoppingBag, Calendar,
  TrendingUp, Users, LogOut, ChevronRight
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import styles from './AdminLayout.module.css'

const NAV = [
  { to: '/admin',              label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Shop applications', icon: Store },
  { to: '/admin/businesses',   label: 'Businesses',  icon: Store },
  { to: '/admin/orders',       label: 'Orders',      icon: ShoppingBag },
  { to: '/admin/bookings',     label: 'Bookings',    icon: Calendar },
  { to: '/admin/commissions',  label: 'Commissions', icon: TrendingUp },
  { to: '/admin/users',        label: 'Users',       icon: Users },
]

export default function AdminLayout() {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

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

          <nav className={styles.nav}>
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navActive : ''}`
                }
              >
                <Icon size={17} />
                <span>{label}</span>
                <ChevronRight size={13} className={styles.chevron} />
              </NavLink>
            ))}
          </nav>
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

      {/* Main content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
