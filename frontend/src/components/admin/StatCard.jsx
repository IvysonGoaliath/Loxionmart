import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, icon: Icon, color = 'var(--green)' }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div>
          <div className={styles.label}>{label}</div>
          <div className={styles.value}>{value}</div>
        </div>
        <div className={styles.icon} style={{ background: color }}>
          <Icon size={20} color="#fff" />
        </div>
      </div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  )
}
