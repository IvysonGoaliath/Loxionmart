import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PageLoader from '../../components/common/PageLoader'
import EmptyState from '../../components/common/EmptyState'
import api from '../../utils/api'
import { formatDateTime, bookingStatusLabel, bookingStatusColor } from '../../utils/format'
import styles from './AdminTable.module.css'

const STATUSES = ['all','pending','confirmed','completed','cancelled']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/bookings/').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
      toast.success('Booking updated')
    } catch { toast.error('Update failed') }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Bookings"
        sub={`${bookings.length} total bookings · ${bookings.filter(b => b.status === 'pending').length} pending confirmation`}
      />

      <div className={styles.toolbar}>
        <div className={styles.pills}>
          {STATUSES.map(s => (
            <button key={s} className={`${styles.pill} ${filter === s ? styles.pillActive : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : bookingStatusLabel(s)}
              <span className={styles.pillCount}>{s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState emoji="📅" title="No bookings found" message="Try a different filter." />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Client</th>
                <th>Business</th>
                <th>Service</th>
                <th>Preferred Date</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Created</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className={styles.bold}>#{b.id}</td>
                  <td className={styles.muted}>Client #{b.client_id}</td>
                  <td className={styles.muted}>Biz #{b.business_id}</td>
                  <td className={styles.muted}>{b.service_id ? `Svc #${b.service_id}` : '—'}</td>
                  <td className={styles.muted}>{b.preferred_date ? formatDateTime(b.preferred_date) : '—'}</td>
                  <td className={styles.notes}>{b.notes || '—'}</td>
                  <td><span className={`badge ${bookingStatusColor(b.status)}`}>{bookingStatusLabel(b.status)}</span></td>
                  <td className={styles.muted}>{formatDateTime(b.created_at)}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={b.status}
                      onChange={e => handleStatusUpdate(b.id, e.target.value)}
                    >
                      {['pending','confirmed','completed','cancelled'].map(s => (
                        <option key={s} value={s}>{bookingStatusLabel(s)}</option>
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
