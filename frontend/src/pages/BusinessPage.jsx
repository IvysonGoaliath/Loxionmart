import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Phone, ShoppingCart, Calendar, ArrowLeft, Plus, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageLoader from '../components/common/PageLoader'
import api from '../utils/api'
import { categoryLabel, categoryEmoji, formatPrice } from '../utils/format'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import styles from './BusinessPage.module.css'

export default function BusinessPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [biz, setBiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})
  const [bookingService, setBookingService] = useState(null)
  const [bookingNote, setBookingNote] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  const { addItem } = useCartStore()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    api.get(`/businesses/${slug}`)
      .then(r => setBiz(r.data))
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = (service) => {
    if (!isLoggedIn()) { navigate('/login', { state: { from: `/business/${slug}` } }); return }
    const result = addItem(service, biz)
    if (result.conflict) {
      toast.error(`Your cart has items from ${result.businessName}. Clear your cart first.`)
      return
    }
    setAdded(a => ({ ...a, [service.id]: true }))
    toast.success(`${service.name} added to cart!`)
    setTimeout(() => setAdded(a => ({ ...a, [service.id]: false })), 2000)
  }

  const handleBook = async (service) => {
    if (!isLoggedIn()) { navigate('/login', { state: { from: `/business/${slug}` } }); return }
    setBookingService(service)
  }

  const submitBooking = async () => {
    if (!bookingService) return
    setBookingLoading(true)
    try {
      await api.post('/bookings/', {
        business_id: biz.id,
        service_id: bookingService.id,
        notes: bookingNote || undefined,
        preferred_date: bookingDate ? new Date(bookingDate).toISOString() : undefined,
      })
      toast.success(`Booking request sent for ${bookingService.name}! We'll confirm via WhatsApp. 📲`)
      setBookingService(null)
      setBookingNote('')
      setBookingDate('')
    } catch {
      toast.error('Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <><Navbar /><PageLoader message="Loading business..." /><Footer /></>
  if (!biz) return null

  const products  = biz.services.filter(s => s.service_type === 'product'  && s.is_available)
  const bookables = biz.services.filter(s => s.service_type === 'booking'  && s.is_available)
  const waUrl = `https://wa.me/${biz.whatsapp_number}?text=${encodeURIComponent(`Hi ${biz.name}! I found you on Loxion Mart and I'd like to enquire.`)}`

  return (
    <>
      <Navbar />
      <main>
        {/* ── Banner ── */}
        <div className={styles.banner} style={{ background: biz.banner_color }}>
          <div className={styles.bannerEmoji}>{biz.emoji}</div>
        </div>

        <div className="container">
          <Link to="/browse" className={styles.back}>
            <ArrowLeft size={15} /> Back to browse
          </Link>

          {/* ── Business info ── */}
          <div className={styles.infoCard}>
            <div className={styles.infoLeft}>
              <div className={styles.bizCat}>{categoryEmoji(biz.category)} {categoryLabel(biz.category)}</div>
              <h1 className={styles.bizName}>{biz.name}</h1>
              <div className={styles.bizMeta}>
                {biz.location && (
                  <span className={styles.metaItem}><MapPin size={13} /> {biz.location}</span>
                )}
                {biz.is_featured && <span className="badge badge-green">⭐ Featured</span>}
              </div>
              {biz.description && <p className={styles.bizDesc}>{biz.description}</p>}
            </div>
            <div className={styles.infoRight}>
              {biz.whatsapp_number && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-green btn-full ${styles.waBtn}`}>
                  💬 Chat on WhatsApp
                </a>
              )}
              <Link to="/browse" className="btn btn-secondary btn-full btn-sm" style={{ marginTop: 8 }}>
                Browse more businesses
              </Link>
            </div>
          </div>

          {/* ── Products (buy now) ── */}
          {products.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Products</h2>
              <div className={styles.serviceGrid}>
                {products.map(s => (
                  <div key={s.id} className={styles.serviceCard}>
                    <div className={styles.serviceLeft}>
                      <span className={styles.serviceEmoji}>{s.emoji}</span>
                      <div>
                        <div className={styles.serviceName}>{s.name}</div>
                        {s.description && <div className={styles.serviceDesc}>{s.description}</div>}
                        <div className={styles.servicePrice}>{formatPrice(s.price)}</div>
                      </div>
                    </div>
                    <button
                      className={`btn ${added[s.id] ? 'btn-green' : 'btn-primary'} btn-sm`}
                      onClick={() => handleAddToCart(s)}
                    >
                      {added[s.id] ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Services (bookings) ── */}
          {bookables.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Services</h2>
              <div className={styles.serviceGrid}>
                {bookables.map(s => (
                  <div key={s.id} className={styles.serviceCard}>
                    <div className={styles.serviceLeft}>
                      <span className={styles.serviceEmoji}>{s.emoji}</span>
                      <div>
                        <div className={styles.serviceName}>{s.name}</div>
                        {s.description && <div className={styles.serviceDesc}>{s.description}</div>}
                        <div className={styles.servicePrice}>{formatPrice(s.price)}</div>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBook(s)}
                    >
                      <Calendar size={13} /> Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Booking modal ── */}
      {bookingService && (
        <div className={styles.modalOverlay} onClick={() => setBookingService(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Book — {bookingService.name}</h2>
            <p className={styles.modalSub}>
              At <strong>{biz.name}</strong> · {formatPrice(bookingService.price)}
            </p>
            <div className={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Preferred date & time (optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes for the business (optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Any special requests or info..."
                  value={bookingNote}
                  onChange={e => setBookingNote(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className={styles.modalActions}>
                <button className="btn btn-secondary" onClick={() => setBookingService(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={submitBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? <><span className="spinner spinner-white" /> Sending...</> : '📲 Send booking request'}
                </button>
              </div>
              <p className={styles.modalNote}>
                You'll get a WhatsApp confirmation once the business accepts.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
