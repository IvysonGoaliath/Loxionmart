import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PageLoader from '../../components/common/PageLoader'
import EmptyState from '../../components/common/EmptyState'
import api from '../../utils/api'
import { formatPrice, formatDateTime, orderStatusLabel, orderStatusColor } from '../../utils/format'
import styles from './AdminTable.module.css'

const STATUSES = ['all','pending_payment','paid','processing','completed','refunded','cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/orders/').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success('Order status updated')
    } catch { toast.error('Update failed') }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || `${o.id}`.includes(search)
    return matchStatus && matchSearch
  })

  const totalRevenue = orders.filter(o => ['paid','completed'].includes(o.status)).reduce((s,o) => s + o.total_amount, 0)

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Orders"
        sub={`${orders.length} total orders · ${formatPrice(totalRevenue)} revenue processed`}
      />

      <div className={styles.toolbar}>
        <div className={styles.pills}>
          {STATUSES.map(s => (
            <button key={s} className={`${styles.pill} ${filter === s ? styles.pillActive : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : orderStatusLabel(s)}
              <span className={styles.pillCount}>{s === 'all' ? orders.length : orders.filter(o => o.status === s).length}</span>
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          placeholder="Search by order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState emoji="📦" title="No orders found" message="Try adjusting your filters." />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Client</th>
                <th>Business</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Commission</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td className={styles.bold}>#{o.id}</td>
                  <td className={styles.muted}>Client #{o.client_id}</td>
                  <td className={styles.muted}>Biz #{o.business_id}</td>
                  <td>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td>{formatPrice(o.subtotal)}</td>
                  <td className={styles.green}>{formatPrice(o.commission_amount)}</td>
                  <td className={styles.bold}>{formatPrice(o.total_amount)}</td>
                  <td><span className={`badge ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span></td>
                  <td className={styles.muted}>{formatDateTime(o.created_at)}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={o.status}
                      onChange={e => handleStatusUpdate(o.id, e.target.value)}
                    >
                      {['pending_payment','paid','processing','completed','refunded','cancelled'].map(s => (
                        <option key={s} value={s}>{orderStatusLabel(s)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
