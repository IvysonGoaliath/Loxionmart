import { useState, useEffect } from 'react'
import { Store, ShoppingBag, Calendar, TrendingUp, Users, Activity } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PageLoader from '../../components/common/PageLoader'
import api from '../../utils/api'
import { formatPrice, formatDateTime, orderStatusColor, orderStatusLabel, bookingStatusColor, bookingStatusLabel } from '../../utils/format'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/businesses/'),
      api.get('/orders/'),
      api.get('/bookings/'),
      api.get('/admin/users'),
      api.get('/admin/commissions'),
    ]).then(([biz, orders, bookings, users, comms]) => {
      setData({
        businesses: biz.data,
        orders: orders.data,
        bookings: bookings.data,
        users: users.data,
        commissions: comms.data,
      })
    }).catch(() => {
      // fallback — load what we can
      Promise.all([
        api.get('/businesses/'),
        api.get('/orders/'),
        api.get('/bookings/'),
      ]).then(([biz, orders, bookings]) => {
        setData({ businesses: biz.data, orders: orders.data, bookings: bookings.data, users: [], commissions: [] })
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.page}><PageLoader /></div>

  const totalRevenue = data.orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + o.total_amount, 0)
  const totalCommission = data.orders.filter(o => o.status === 'paid' || o.status === 'completed').reduce((s, o) => s + o.commission_amount, 0)
  const recentOrders = [...data.orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
  const recentBookings = [...data.bookings].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Dashboard"
        sub="Welcome back — here's what's happening on Loxion Mart"
      />

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Businesses" value={data.businesses.length} icon={Store} color="var(--black)" sub={`${data.businesses.filter(b => b.is_featured).length} featured`} />
        <StatCard label="Total Orders" value={data.orders.length} icon={ShoppingBag} color="#7c3aed" sub={`${data.orders.filter(o => o.status === 'pending_payment').length} awaiting payment`} />
        <StatCard label="Bookings" value={data.bookings.length} icon={Calendar} color="#0369a1" sub={`${data.bookings.filter(b => b.status === 'pending').length} pending`} />
        <StatCard label="Revenue Processed" value={formatPrice(totalRevenue)} icon={TrendingUp} color="var(--green)" sub={`${formatPrice(totalCommission)} your commission`} />
      </div>

      <div className={styles.cols}>
        {/* Recent orders */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            <h2 className={styles.tableTitle}>Recent Orders</h2>
            <a href="/admin/orders" className={styles.tableLink}>View all →</a>
          </div>
          {recentOrders.length === 0 ? (
            <p className={styles.empty}>No orders yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td className={styles.bold}>#{o.id}</td>
                    <td>{formatPrice(o.total_amount)}</td>
                    <td><span className={`badge ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span></td>
                    <td className={styles.muted}>{formatDateTime(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent bookings */}
        <div className={styles.tableCard}>
          <div className={styles.tableHead}>
            <h2 className={styles.tableTitle}>Recent Bookings</h2>
            <a href="/admin/bookings" className={styles.tableLink}>View all →</a>
          </div>
          {recentBookings.length === 0 ? (
            <p className={styles.empty}>No bookings yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td className={styles.bold}>#{b.id}</td>
                    <td>Biz #{b.business_id}</td>
                    <td><span className={`badge ${bookingStatusColor(b.status)}`}>{bookingStatusLabel(b.status)}</span></td>
                    <td className={styles.muted}>{formatDateTime(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Business overview */}
      <div className={styles.tableCard} style={{ marginTop: '1.5rem' }}>
        <div className={styles.tableHead}>
          <h2 className={styles.tableTitle}>Business Overview</h2>
          <a href="/admin/businesses" className={styles.tableLink}>Manage →</a>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Business</th>
              <th>Category</th>
              <th>Commission</th>
              <th>Featured</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.businesses.map(b => (
              <tr key={b.id}>
                <td className={styles.bold}>{b.name}</td>
                <td className={styles.muted}>{b.category}</td>
                <td>{(b.commission_rate * 100).toFixed(0)}%</td>
                <td>{b.is_featured ? '⭐' : '—'}</td>
                <td>
                  <span className={`badge ${b.is_active ? 'badge-green' : 'badge-red'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
