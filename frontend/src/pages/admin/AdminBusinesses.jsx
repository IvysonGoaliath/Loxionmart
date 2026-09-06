import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import PageLoader from '../../components/common/PageLoader'
import api from '../../utils/api'
import { categoryLabel } from '../../utils/format'
import styles from './AdminBusinesses.module.css'

const CATS = [
  { value: 'hair_beauty',   label: 'Hair & Beauty' },
  { value: 'phones_tech',   label: 'Phones & Tech' },
  { value: 'food_catering', label: 'Food & Catering' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'fashion',       label: 'Fashion' },
  { value: 'other',         label: 'Other' },
]

const EMPTY_FORM = {
  name: '', category: 'hair_beauty', description: '', location: '',
  whatsapp_number: '', banner_color: '#1e1e1c', emoji: '🏪',
  commission_rate: 0.10, is_featured: false,
}

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | business obj
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [servicesModal, setServicesModal] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/businesses')
      .then(r => setBusinesses(r.data))
      .catch(() => toast.error('Could not load businesses. Please refresh to retry.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (biz) => {
    setForm({
      name: biz.name, category: biz.category,
      description: biz.description || '', location: biz.location || '',
      whatsapp_number: biz.whatsapp_number || '',
      banner_color: biz.banner_color, emoji: biz.emoji,
      commission_rate: biz.commission_rate, is_featured: biz.is_featured,
      is_active: biz.is_active,
    })
    setModal(biz)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Business name is required'); return }
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/businesses/', { ...form, commission_rate: parseFloat(form.commission_rate) })
        toast.success('Business created!')
      } else {
        await api.put(`/businesses/${modal.id}`, { ...form, commission_rate: parseFloat(form.commission_rate) })
        toast.success('Business updated!')
      }
      setModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (biz) => {
    if (!confirm(`Deactivate "${biz.name}"?`)) return
    try {
      await api.delete(`/businesses/${biz.id}`)
      toast.success('Business deactivated')
      load()
    } catch { toast.error('Failed to deactivate') }
  }

  const toggleFeatured = async (biz) => {
    try {
      await api.put(`/businesses/${biz.id}`, { is_featured: !biz.is_featured })
      toast.success(biz.is_featured ? 'Removed from featured' : 'Marked as featured ⭐')
      load()
    } catch { toast.error('Update failed') }
  }

  const toggleActive = async (biz) => {
    if (updatingStatus !== null) return
    setUpdatingStatus(biz.id)
    try {
      const { data } = await api.put(`/businesses/${biz.id}`, { is_active: !biz.is_active })
      setBusinesses(current => current.map(item => item.id === biz.id ? data : item))
      toast.success(data.is_active ? 'Business is now visible to customers' : 'Business hidden from customers')
    } catch {
      toast.error('Could not change business status. Please try again.')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Businesses"
        sub={`${businesses.length} businesses listed on Loxion Mart`}
        action={<button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add business</button>}
      />

      {loading ? <PageLoader /> : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Category</th>
                <th>Location</th>
                <th>Commission</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map(biz => (
                <tr key={biz.id}>
                  <td>
                    <div className={styles.bizCell}>
                      <div className={styles.bizBanner} style={{ background: biz.banner_color }}>{biz.emoji}</div>
                      <div>
                        <div className={styles.bizName}>{biz.name}</div>
                        <div className={styles.bizSlug}>/{biz.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.muted}>{categoryLabel(biz.category)}</td>
                  <td className={styles.muted}>{biz.location || '—'}</td>
                  <td><span className={styles.rate}>{(biz.commission_rate * 100).toFixed(0)}%</span></td>
                  <td>
                    <button className={styles.featBtn} onClick={() => toggleFeatured(biz)}>
                      {biz.is_featured
                        ? <ToggleRight size={22} color="var(--green)" />
                        : <ToggleLeft size={22} color="var(--gray-light)" />}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={biz.is_active}
                      aria-label={`Visible to customers: ${biz.name}`}
                      title={biz.is_active ? 'Hide this business from customers' : 'Show this business to customers'}
                      className={`btn btn-secondary btn-sm ${styles.statusBtn}`}
                      disabled={updatingStatus !== null}
                      aria-busy={updatingStatus === biz.id}
                      onClick={() => toggleActive(biz)}
                    >
                      {biz.is_active ? <ToggleRight size={22} color="var(--green)" /> : <ToggleLeft size={22} />}
                      {updatingStatus === biz.id ? 'Saving…' : biz.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setServicesModal(biz)}>
                        Services
                      </button>
                      <button className="btn btn-secondary btn-sm" disabled={updatingStatus !== null} onClick={() => openEdit(biz)}>
                        <Pencil size={13} />
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={updatingStatus !== null || !biz.is_active} onClick={() => handleDelete(biz)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit modal */}
      {modal !== null && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{modal === 'create' ? 'Add business' : `Edit — ${modal.name}`}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><X size={18} /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Business name *</label>
                  <input className="form-input" value={form.name} onChange={f('name')} placeholder="e.g. Tshidi Hair Studio" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={f('category')}>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={f('description')} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={f('location')} placeholder="e.g. Pretoria, GP" />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp number</label>
                  <input className="form-input" value={form.whatsapp_number} onChange={f('whatsapp_number')} placeholder="27712345678" />
                </div>
                <div className="form-group">
                  <label className="form-label">Banner colour</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.banner_color} onChange={f('banner_color')} style={{ width: 44, height: 38, borderRadius: 6, border: '1.5px solid var(--gray-line)', padding: 2 }} />
                    <input className="form-input" value={form.banner_color} onChange={f('banner_color')} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input className="form-input" value={form.emoji} onChange={f('emoji')} placeholder="🏪" maxLength={4} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission rate (0.10 = 10%)</label>
                  <input className="form-input" type="number" min="0" max="1" step="0.01" value={form.commission_rate} onChange={f('commission_rate')} />
                </div>
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="featured" checked={form.is_featured} onChange={f('is_featured')} style={{ width: 16, height: 16 }} />
                  <label htmlFor="featured" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Mark as featured ⭐</label>
                </div>
                {modal !== 'create' && (
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="business-active" checked={form.is_active} onChange={f('is_active')} style={{ width: 16, height: 16 }} />
                    <label htmlFor="business-active" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Active — visible to customers</label>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFoot}>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner spinner-white" /> : <Check size={15} />}
                {modal === 'create' ? 'Create business' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services modal */}
      {servicesModal && (
        <ServicesModal biz={servicesModal} onClose={() => setServicesModal(null)} />
      )}
    </div>
  )
}

function ServicesModal({ biz, onClose }) {
  const [services, setServices] = useState(biz.services || [])
  const [form, setForm] = useState({ name: '', price: '', emoji: '🛍️', service_type: 'booking', description: '' })
  const [saving, setSaving] = useState(false)

  const load = () => api.get(`/businesses/${biz.id}/services/`).then(r => setServices(r.data))

  const handleAdd = async () => {
    if (!form.name || !form.price) { toast.error('Name and price required'); return }
    setSaving(true)
    try {
      await api.post(`/businesses/${biz.id}/services/`, { ...form, price: parseFloat(form.price) })
      toast.success('Service added!')
      setForm({ name: '', price: '', emoji: '🛍️', service_type: 'booking', description: '' })
      load()
    } catch { toast.error('Failed to add') } finally { setSaving(false) }
  }

  const handleRemove = async (svcId) => {
    if (!confirm('Remove this service?')) return
    try {
      await api.delete(`/businesses/${biz.id}/services/${svcId}`)
      toast.success('Service removed')
      load()
    } catch { toast.error('Failed to remove') }
  }

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Services — {biz.name}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          {/* Existing services */}
          <div className={styles.svcList}>
            {services.length === 0 && <p className={styles.emptySvc}>No services yet. Add one below.</p>}
            {services.map(s => (
              <div key={s.id} className={styles.svcRow}>
                <span className={styles.svcEmoji}>{s.emoji}</span>
                <div className={styles.svcInfo}>
                  <div className={styles.svcName}>{s.name}</div>
                  <div className={styles.svcMeta}>R{s.price} · {s.service_type}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleRemove(s.id)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>

          <div className={styles.svcDivider}>Add new service</div>

          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Service name *</label>
              <input className="form-input" value={form.name} onChange={f('name')} placeholder="e.g. Box Braids" />
            </div>
            <div className="form-group">
              <label className="form-label">Price (R) *</label>
              <input className="form-input" type="number" value={form.price} onChange={f('price')} placeholder="350" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.service_type} onChange={f('service_type')}>
                <option value="booking">Booking (appointment)</option>
                <option value="product">Product (buy now)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input className="form-input" value={form.emoji} onChange={f('emoji')} maxLength={4} />
            </div>
          </div>
        </div>
        <div className={styles.modalFoot}>
          <button className="btn btn-secondary" onClick={onClose}>Done</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>
            {saving ? <span className="spinner spinner-white" /> : <Plus size={14} />}
            Add service
          </button>
        </div>
      </div>
    </div>
  )
}
