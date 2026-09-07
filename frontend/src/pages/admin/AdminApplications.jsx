import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { errorMessage } from '../../utils/mall'
import { categoryLabel, formatDateTime } from '../../utils/format'
import api from '../../utils/api'
import styles from './AdminApplications.module.css'

const STATUSES = { pending: 'In review', rejected: 'Rejected', approved: 'Approved' }

export default function AdminApplications() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const status = Object.hasOwn(STATUSES, params.get('status')) ? params.get('status') : 'pending'
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [notes, setNotes] = useState({})
  const [validation, setValidation] = useState({})

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(id ? '/merchant/shops/' + id : '/merchant/applications', {
        params: id ? undefined : { status }, signal,
      })
      if (!signal?.aborted) setShops(id ? [response.data] : response.data)
    } catch (err) {
      if (!signal?.aborted) setError(errorMessage(err, 'Could not load applications. Please retry.'))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [id, status])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function review(shop, decision) {
    if (busy !== null) return
    const note = (notes[shop.id] || '').trim()
    if (decision === 'rejected' && !note) {
      setValidation(current => ({ ...current, [shop.id]: 'Enter a rejection reason so the owner knows what to fix.' }))
      return
    }
    setBusy(shop.id)
    setValidation(current => ({ ...current, [shop.id]: '' }))
    try {
      await api.put('/merchant/applications/' + shop.id, { decision, note })
      setNotes(current => ({ ...current, [shop.id]: '' }))
      toast.success(decision === 'approved' ? 'Application approved. The shop is now live.' : 'Application rejected. The owner can see your reason in their workspace.')
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return <div className={styles.page}>
    {id && <Link to="/admin/applications" className={styles.back}><ArrowLeft size={16} />All shop applications</Link>}
    <AdminPageHeader title={id ? 'Review shop application' : 'Shop applications'}
      sub="Approve a shop to publish it, or reject it with a reason the owner can act on."
      action={<Link className="btn btn-secondary" to="/admin/businesses">Manage businesses</Link>} />

    {!id && <nav className={styles.filters} aria-label="Application status">
      {Object.entries(STATUSES).map(([value, label]) => <button type="button" key={value}
        aria-pressed={status === value} disabled={busy !== null}
        onClick={() => setParams({ status: value })}>{label}</button>)}
    </nav>}

    {loading ? <p className={styles.empty} role="status">Loading applications…</p> : error ?
      <div className={styles.empty}><p role="alert">{error}</p><button className="btn btn-secondary" onClick={() => load()}>Retry</button></div> :
      shops.length ? <div className={styles.list}>{shops.map(shop => <article className={styles.card} key={shop.id}>
        <div className={styles.heading}>
          <div><h2>{shop.name}</h2><p>{categoryLabel(shop.category)} · {shop.location || 'Location not supplied'}</p></div>
          <span className={'mall-status ' + shop.approval_status}>{STATUSES[shop.approval_status] || shop.approval_status}</span>
        </div>
        <p className={styles.description}>{shop.description || 'No shop description supplied.'}</p>
        <dl className={styles.details}>
          <div><dt>WhatsApp</dt><dd>{shop.whatsapp_number || 'Not supplied'}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDateTime(shop.created_at)}</dd></div>
          <div><dt>Catalogue</dt><dd>{shop.services.length} listings</dd></div>
          {id && [['opening_hours', 'Opening hours'], ['collection_info', 'Collection'], ['delivery_info', 'Delivery'], ['returns_info', 'Returns & cancellations']].map(([key, label]) =>
            <div key={key}><dt>{label}</dt><dd>{shop[key] || 'Not supplied'}</dd></div>)}
        </dl>
        <div className={styles.links}>
          {!id && <Link to={'/admin/applications/' + shop.id} className="mall-text-link">View full application →</Link>}
          <Link to={'/merchant/' + shop.id} className="mall-text-link">Review catalogue & photos →</Link>
        </div>

        {shop.review_note && <div className={styles.feedback}><strong>Feedback shared with the owner</strong><p>{shop.review_note}</p></div>}

        {shop.approval_status === 'approved' ? <div className={styles.approved}>
          <CheckCircle2 size={20} /><p>This application is approved. Shop visibility is managed under <Link to="/admin/businesses">Businesses</Link>.</p>
        </div> : <div className={styles.review}>
          <label htmlFor={'review-note-' + shop.id}>Decision note / rejection reason</label>
          <p id={'review-help-' + shop.id}>Required for rejection; optional for approval. The owner sees this message in their shop workspace and can update and resubmit a rejected application.</p>
          <textarea id={'review-note-' + shop.id} rows={4} maxLength={1500} disabled={busy !== null}
            value={notes[shop.id] || ''} placeholder="Explain your decision and any changes the owner needs to make."
            aria-invalid={Boolean(validation[shop.id])}
            aria-describedby={'review-help-' + shop.id + (validation[shop.id] ? ' review-error-' + shop.id : '')}
            onChange={event => { setNotes(current => ({ ...current, [shop.id]: event.target.value })); setValidation(current => ({ ...current, [shop.id]: '' })) }} />
          {validation[shop.id] && <p className={styles.error} role="alert" id={'review-error-' + shop.id}>{validation[shop.id]}</p>}
          <div className={styles.actions}>
            <button className="btn btn-primary" disabled={busy !== null} onClick={() => review(shop, 'approved')}><CheckCircle2 size={17} />{busy === shop.id ? 'Saving decision…' : 'Approve & publish shop'}</button>
            <button className="btn btn-danger" disabled={busy !== null} onClick={() => review(shop, 'rejected')}><XCircle size={17} />{shop.approval_status === 'rejected' ? 'Update rejection reason' : 'Reject application'}</button>
          </div>
        </div>}
      </article>)}</div> : <div className={styles.empty}><h2>{status === 'pending' ? 'No applications waiting for review.' : 'No ' + STATUSES[status].toLowerCase() + ' applications.'}</h2><p>New shop applications appear under In review. Completed decisions appear under Approved or Rejected.</p></div>}
  </div>
}
