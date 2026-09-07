import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageLoader from '../components/common/PageLoader'
import EmptyState from '../components/common/EmptyState'
import api from '../utils/api'
import { formatDateTime, bookingStatusLabel, bookingStatusColor, formatPrice } from '../utils/format'
import styles from './MyBookingsPage.module.css'

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings/my').then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main id="mall-content" className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>My Bookings</h1>
          {loading ? <PageLoader /> : bookings.length === 0 ? (
            <EmptyState
              emoji="📅"
              title="No bookings yet"
              message="Browse local businesses and book your first appointment."
              action={<Link to="/browse" className="btn btn-primary">Browse businesses</Link>}
            />
          ) : (
            <div className={styles.list}>
              {bookings.map(b => (
                <div key={b.id} className={styles.card}>
                  <div className={styles.head}>
                    <div>
                      <div className={styles.bookingId}>Booking #{b.id}</div>
                      <div className={styles.date}>{formatDateTime(b.created_at)}</div>
                    </div>
                    <span className={`badge ${bookingStatusColor(b.status)}`}>
                      {bookingStatusLabel(b.status)}
                    </span>
                  </div>
                  {b.preferred_date && (
                    <div className={styles.preferred}>📅 Preferred: {formatDateTime(b.preferred_date)}</div>
                  )}
                  {b.notes && <div className={styles.notes}>"{b.notes}"</div>}
                  {b.total_amount && <div className={styles.amount}>{formatPrice(b.total_amount)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
