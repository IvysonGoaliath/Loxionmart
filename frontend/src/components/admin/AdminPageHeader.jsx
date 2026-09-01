import styles from './AdminPageHeader.module.css'

export default function AdminPageHeader({ title, sub, action }) {
  return (
    <div className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
