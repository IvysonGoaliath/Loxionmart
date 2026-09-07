import { useState } from 'react'
import { User, Mail, Phone, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import api from '../utils/api'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api.put('/auth/me', form)
      setAuth(res.data, token)
      toast.success('Profile updated!')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main id="mall-content" className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.avatar}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className={styles.name}>{user?.full_name}</h1>
              <p className={styles.email}>{user?.email}</p>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Edit profile</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    value={user?.email}
                    disabled
                  />
                </div>
                <span className="form-hint">Email cannot be changed</span>
              </div>

              <div className="form-group">
                <label className="form-label">Phone number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                  <input
                    className="form-input"
                    style={{ paddingLeft: 38 }}
                    type="tel"
                    placeholder="082 000 0000"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <span className="spinner" /> : <Save size={15} />}
                Save changes
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
