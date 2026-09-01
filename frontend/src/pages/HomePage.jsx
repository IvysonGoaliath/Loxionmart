import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, MapPin, Star } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageLoader from '../components/common/PageLoader'
import api from '../utils/api'
import { categoryLabel, categoryEmoji, truncate, formatPrice } from '../utils/format'
import styles from './HomePage.module.css'

const CATEGORIES = [
  { id: 'hair_beauty',   label: 'Hair & Beauty',   emoji: '💇', desc: 'Braids, weaves, nails & more' },
  { id: 'phones_tech',   label: 'Phones & Tech',   emoji: '📱', desc: 'Phones, repairs & accessories' },
  { id: 'food_catering', label: 'Food & Catering', emoji: '🍲', desc: 'Meals, delivery & events' },
  { id: 'home_services', label: 'Home Services',   emoji: '🔧', desc: 'Plumbing, cleaning & more' },
  { id: 'fashion',       label: 'Fashion',          emoji: '👗', desc: 'Clothing & accessories' },
  { id: 'other',         label: 'Other',            emoji: '🏪', desc: 'All other local businesses' },
]

export default function HomePage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/businesses/').then(r => setBusinesses(r.data)).finally(() => setLoading(false))
  }, [])

  const featured = businesses.filter(b => b.is_featured)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/browse?q=${encodeURIComponent(search.trim())}`)
  }

  if (loading) return <><Navbar /><PageLoader message="Loading Loxion Mart..." /><Footer /></>

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <span className={styles.heroEye}>🇿🇦 Mzansi's local marketplace</span>
              <h1 className={styles.heroTitle}>
                Shop Local,<br />Shop Lekker!
              </h1>
              <p className={styles.heroSub}>
                Book hair appointments, buy phones, order food — all from businesses in your loxion.
              </p>
              <form className={styles.searchBar} onSubmit={handleSearch}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search businesses or services..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>Search</button>
              </form>
              <div className={styles.heroStats}>
                <div className={styles.stat}><strong>{businesses.length}</strong> businesses</div>
                <div className={styles.statDot} />
                <div className={styles.stat}><strong>6</strong> categories</div>
                <div className={styles.statDot} />
                <div className={styles.stat}><strong>100%</strong> SA owned</div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <img src="/logo.png" alt="Loxion Mart" className={styles.heroLogo} />
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Browse by category</h2>
              <Link to="/browse" className={`btn btn-ghost btn-sm ${styles.seeAll}`}>
                See all <ArrowRight size={14} />
              </Link>
            </div>
            <div className={styles.catGrid}>
              {CATEGORIES.map(c => (
                <Link key={c.id} to={`/browse?cat=${c.id}`} className={styles.catCard}>
                  <span className={styles.catEmoji}>{c.emoji}</span>
                  <div className={styles.catName}>{c.label}</div>
                  <div className={styles.catDesc}>{c.desc}</div>
                  <div className={styles.catCount}>
                    {businesses.filter(b => b.category === c.id).length} listed
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured businesses ── */}
        {featured.length > 0 && (
          <section className={styles.section}>
            <div className="container">
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Featured businesses</h2>
                <Link to="/browse?featured=true" className={`btn btn-ghost btn-sm ${styles.seeAll}`}>
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.bizGrid}>
                {featured.map(biz => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── All businesses ── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>All businesses</h2>
              <span className={styles.bizCount}>{businesses.length} listed</span>
            </div>
            <div className={styles.bizGrid}>
              {businesses.map(biz => <BusinessCard key={biz.id} biz={biz} />)}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className={styles.ctaBanner}>
          <div className="container">
            <div className={styles.ctaInner}>
              <div>
                <h2 className={styles.ctaTitle}>Own a local business?</h2>
                <p className={styles.ctaSub}>Get listed on Loxion Mart and reach more customers in your area — for free.</p>
              </div>
              <a
                href="https://wa.me/27700000000?text=Hi! I'd like to list my business on Loxion Mart."
                target="_blank" rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                💬 WhatsApp us to list
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function BusinessCard({ biz }) {
  return (
    <Link to={`/business/${biz.slug}`} className={styles.bizCard}>
      <div className={styles.bizBanner} style={{ background: biz.banner_color }}>
        <span className={styles.bizEmoji}>{biz.emoji}</span>
        {biz.is_featured && <span className={`badge badge-green ${styles.featBadge}`}>⭐ Featured</span>}
      </div>
      <div className={styles.bizBody}>
        <div className={styles.bizCat}>{categoryEmoji(biz.category)} {categoryLabel(biz.category)}</div>
        <div className={styles.bizName}>{biz.name}</div>
        <div className={styles.bizDesc}>{truncate(biz.description, 90)}</div>
        <div className={styles.bizFoot}>
          <span className={styles.bizLoc}><MapPin size={12} /> {biz.location}</span>
          <span className={styles.bizArrow}>View store <ArrowRight size={13} /></span>
        </div>
      </div>
    </Link>
  )
}
