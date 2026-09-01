import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Public pages
import HomePage        from './pages/HomePage'
import BrowsePage      from './pages/BrowsePage'
import BusinessPage    from './pages/BusinessPage'
import NotFoundPage    from './pages/NotFoundPage'

// Auth pages
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'

// Protected pages
import CartPage        from './pages/CartPage'
import MyOrdersPage    from './pages/MyOrdersPage'
import MyBookingsPage  from './pages/MyBookingsPage'
import ProfilePage     from './pages/ProfilePage'

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminBusinesses   from './pages/admin/AdminBusinesses'
import AdminOrders       from './pages/admin/AdminOrders'
import AdminBookings     from './pages/admin/AdminBookings'
import AdminCommissions  from './pages/admin/AdminCommissions'
import AdminUsers        from './pages/admin/AdminUsers'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"               element={<HomePage />} />
      <Route path="/browse"         element={<BrowsePage />} />
      <Route path="/business/:slug" element={<BusinessPage />} />

      {/* Auth — guests only */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected — must be logged in */}
      <Route path="/cart"        element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/my-orders"   element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Admin — nested under AdminLayout with sidebar */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index              element={<AdminDashboard />} />
        <Route path="businesses"  element={<AdminBusinesses />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="bookings"    element={<AdminBookings />} />
        <Route path="commissions" element={<AdminCommissions />} />
        <Route path="users"       element={<AdminUsers />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
