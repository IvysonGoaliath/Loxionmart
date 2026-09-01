import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import StatCard from '../../components/admin/StatCard'
import PageLoader from '../../components/common/PageLoader'
import EmptyState from '../../components/common/EmptyState'
import api from '../../utils/api'
import { formatPrice, formatDateTime } from '../../utils/format'
import styles from './AdminTable.module.css'
import cStyles from './AdminCommissions.module.css'

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    api.get('/admin/commissions').then(r => setCommissions(r.data)).catch(() => setCommissions([])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleMarkPaid = async (id) => {
    try {
      await api.put(`/admin/commissions/${id}`, { status: 'paid_out' })
      toast.success('Marked as paid out')
      load()
    } catch { toast.error('Update failed') }
  }

  const pending   = commissions.filter(c => c.status === 'pending')
  const paidOut   = commissions.filter(c => c.status === 'paid_out')
  const totalPending   = pending.reduce((s,c) => s + c.amount, 0)
  const totalEarned    = commissions.reduce((s,c) => s + c.amount, 0)
  const totalPaidOut   = paidOut.reduce((s,c) => s + c.amount, 0)

  const filtered = filter === 'all' ? commissions : commissions.filter(c => c.status === filter)

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Commissions"
        sub="Track earnings from completed orders across all businesses"
      />

      <div className={cStyles.statsRow}>
        <StatCard label="Total Earned"   value={formatPrice(totalEarned)}   icon={TrendingUp}   color="var(--green)" />
        <StatCard label="Pending Payout" value={formatPrice(totalPending)}  icon={Clock}        color="var(--amber)" sub={`${pending.length} commission${pending.length !== 1 ? 's' : ''} pending`} />
        <StatCard label="Paid Out"       value={formatPrice(totalPaidOut)}  icon={CheckCircle}  color="var(--black)" sub={`${paidOut.length} paid out`} />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.pills}>
          {['all','pending','paid_out'].map(s => (
            <button key={s} className={`${styles.pill} ${filter === s ? styles.pillActive : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : 'Paid Out'}
              <span className={styles.pillCount}>{s === 'all' ? commissions.length : commissions.filter(c => c.status === s).length}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState emoji="💰" title="No commissions yet" message="Commissions are recorded when orders are paid." />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Business</th>
                <th>Order</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className={styles.bold}>#{c.id}</td>
                  <td className={styles.muted}>Biz #{c.business_id}</td>
                  <td className={styles.muted}>{c.order_id ? `Order #${c.order_id}` : '—'}</td>
                  <td>{(c.rate * 100).toFixed(0)}%</td>
                  <td className={styles.green}>{formatPrice(c.amount)}</td>
                  <td>
                    <span className={`badge ${c.status === 'pending' ? 'badge-amber' : 'badge-green'}`}>
                      {c.status === 'pending' ? 'Pending' : 'Paid Out'}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDateTime(c.created_at)}</td>
                  <td>
                    {c.status === 'pending' && (
                      <button className="btn btn-green btn-sm" onClick={() => handleMarkPaid(c.id)}>
                        Mark paid
                      </button>
                    )}
                    {c.status === 'paid_out' && (
                      <span className={styles.muted}>{c.paid_out_at ? formatDateTime(c.paid_out_at) : '—'}</span>
                    )}
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
