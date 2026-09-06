import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { categoryLabel } from '../../utils/format'
import styles from './BusinessCard.module.css'
export default function BusinessCard({ biz }) {
  return <Link to={`/business/${biz.slug}`} className={styles.card}>
    <div className={styles.top}><span className={styles.category}>{categoryLabel(biz.category)}</span>{biz.is_featured && <span className={styles.featured}><Star size={12} /> Featured</span>}</div>
    <div className={styles.identity}><span className={styles.avatar} aria-hidden="true">{biz.emoji || biz.name.slice(0, 1)}</span><ArrowUpRight size={24} className={styles.arrow} /></div>
    <h3 className={styles.name}>{biz.name}</h3><p className={styles.description}>{biz.description || 'Discover what this local business has to offer.'}</p>
    <div className={styles.bottom}><span><MapPin size={14} />{biz.location || 'Local business'}</span><strong>Explore</strong></div>
  </Link>
}
