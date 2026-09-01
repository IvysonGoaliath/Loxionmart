import { useState, useEffect } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PageLoader from '../../components/common/PageLoader'
import EmptyState from '../../components/common/EmptyState'
import api from '../../utils/api'
import { formatDateTime } from '../../utils/format'
import styles from './AdminTable.module.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => setUsers([])).finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Users"
        sub={`${users.length} registered clients`}
      />

      <div className={styles.toolbar}>
        <div />
        <input
          className={styles.search}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState emoji="👥" title="No users found" message="No clients have registered yet." />
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className={styles.bold}>#{u.id}</td>
                  <td className={styles.bold}>{u.full_name}</td>
                  <td className={styles.muted}>{u.email}</td>
                  <td className={styles.muted}>{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-black' : 'badge-gray'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDateTime(u.created_at)}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
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
