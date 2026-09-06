import BusinessCard from '../components/common/BusinessCard'
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
  const [error, setError] = useState(false)
  const [search, setSearch] = useState(params.get('q') || '')

  const activeCat = params.get('cat') || ''

  useEffect(() => {
    setLoading(true)
    setError(false)
    const url = activeCat ? `/businesses/?category=${activeCat}` : '/businesses/'
    api.get(url).then(r => setBusinesses(r.data)).catch(() => setError(true)).finally(() => setLoading(false))
  }, [activeCat])

  const filtered = businesses.filter(b => {
    if (params.get('featured') === 'true' && !b.is_featured) return false
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
    next.delete('featured')
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
                aria-label="Search businesses"
                placeholder="Search by name, service or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button aria-label="Clear search" className={styles.clearBtn} onClick={clearSearch}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Category pills ── */}
          <div className={styles.pills}>
            {CATEGORIES.map(c => (
              <button
                aria-pressed={activeCat === c.id}
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
          ) : error ? (<EmptyState emoji="" title="Businesses are taking a little longer" message="Please refresh to try again." />) : filtered.length === 0 ? (
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
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
