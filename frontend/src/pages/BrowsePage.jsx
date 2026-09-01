import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ArrowRight, MapPin } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageLoader from '../components/common/PageLoader'
import EmptyState from '../components/common/EmptyState'
import api from '../utils/api'
import { categoryLabel, categoryEmoji, truncate } from '../utils/format'
import styles from './BrowsePage.module.css'

const CATEGORIES = [
  { id: '', label: 'All' },
  { id: 'hair_beauty',   label: 'Hair & Beauty',   emoji: '💇' },
  { id: 'phones_tech',   label: 'Phones & Tech',   emoji: '📱' },
  { id: 'food_catering', label: 'Food & Catering', emoji: '🍲' },
  { id: 'home_services', label: 'Home Services',   emoji: '🔧' },
  { id: 'fashion',       label: 'Fashion',          emoji: '👗' },
  { id: 'other',         label: 'Other',            emoji: '🏪' },
]

export default function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get('q') || '')

  const activeCat = params.get('cat') || ''

  useEffect(() => {
    setLoading(true)
    const url = activeCat ? `/businesses/?category=${activeCat}` : '/businesses/'
    api.get(url).then(r => setBusinesses(r.data)).finally(() => setLoading(false))
  }, [activeCat])

  const filtered = businesses.filter(b => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.name.toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q)
    )
  })

  const setCategory = (cat) => {
    const next = new URLSearchParams(params)
    if (cat) next.set('cat', cat); else next.delete('cat')
    next.delete('q')
    setSearch('')
    setParams(next)
  }

  const clearSearch = () => setSearch('')

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ── Browse header ── */}
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              {activeCat ? `${categoryEmoji(activeCat)} ${categoryLabel(activeCat)}` : 'Browse all businesses'}
            </h1>
            <p className={styles.sub}>
              {loading ? 'Loading...' : `${filtered.length} business${filtered.length !== 1 ? 'es' : ''} found`}
            </p>
          </div>
        </div>

        <div className="container">
          {/* ── Search bar ── */}
          <div className={styles.searchWrap}>
            <div className={styles.searchBar}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, service or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button className={styles.clearBtn} onClick={clearSearch}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Category pills ── */}
          <div className={styles.pills}>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`${styles.pill} ${activeCat === c.id ? styles.pillActive : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.emoji && <span>{c.emoji}</span>} {c.label}
              </button>
            ))}
          </div>

          {/* ── Results ── */}
          {loading ? (
            <PageLoader message="Finding businesses..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No businesses found"
              message={search ? `No results for "${search}". Try a different search or category.` : 'No businesses in this category yet.'}
              action={<button className="btn btn-primary" onClick={() => { clearSearch(); setCategory('') }}>Clear filters</button>}
            />
          ) : (
            <div className={styles.grid}>
              {filtered
                .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
                .map(biz => (
                  <BizCard key={biz.id} biz={biz} />
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function BizCard({ biz }) {
  return (
    <Link to={`/business/${biz.slug}`} className={styles.card}>
      <div className={styles.banner} style={{ background: biz.banner_color }}>
        <span className={styles.emoji}>{biz.emoji}</span>
        {biz.is_featured && <span className={`badge badge-green ${styles.feat}`}>⭐ Featured</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.cat}>{categoryEmoji(biz.category)} {categoryLabel(biz.category)}</div>
        <div className={styles.name}>{biz.name}</div>
        <div className={styles.desc}>{truncate(biz.description, 85)}</div>
        <div className={styles.foot}>
          <span className={styles.loc}><MapPin size={11} /> {biz.location}</span>
          <span className={styles.cta}>View <ArrowRight size={12} /></span>
        </div>
      </div>
    </Link>
  )
}
