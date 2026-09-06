import BrandLogo from '../components/common/BrandLogo'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoading } = useAuthStore()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const { success, error } = await register({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || undefined,
      password: form.password,
    })
    if (success) {
      toast.success(`Welcome to Loxion Mart, ${form.full_name.split(' ')[0]}! 🎉`)
      navigate(from, { replace: true })
    } else {
      toast.error(error || 'Registration failed')
    }
  }

  const pwStrength = () => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Too short', color: 'var(--red-500)', width: '25%' }
    if (p.length < 8) return { label: 'Weak', color: '#f59e0b', width: '50%' }
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: 'var(--green-500)', width: '100%' }
    return { label: 'Good', color: 'var(--green-400)', width: '75%' }
  }
  const strength = pwStrength()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logoWrap}>
            <BrandLogo />
          </Link>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.sub}>Join Mzansi's local marketplace — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadded} ${errors.full_name ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Thabo Nkosi"
                value={form.full_name}
                onChange={set('full_name')}
                autoFocus
              />
            </div>
            {errors.full_name && <span className="form-error">{errors.full_name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadded} ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number <span className={styles.optional}>(optional)</span></label>
            <div className={styles.inputWrap}>
              <Phone size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadded}`}
                type="tel"
                placeholder="e.g. 082 000 0000"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>
            <span className="form-hint">Used for booking confirmations via WhatsApp</span>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadded} ${styles.inputPaddedRight} ${errors.password ? 'error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={set('password')}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {strength && (
              <div className={styles.strengthBar}>
                <div className={styles.strengthTrack}>
                  <div className={styles.strengthFill} style={{ width: strength.width, background: strength.color }} />
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                className={`form-input ${styles.inputPadded} ${errors.confirm_password ? 'error' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm_password}
                onChange={set('confirm_password')}
              />
              {form.confirm_password && form.password === form.confirm_password && (
                <CheckCircle size={16} className={styles.checkIcon} />
              )}
            </div>
            {errors.confirm_password && <span className="form-error">{errors.confirm_password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
            style={{ marginTop: '0.5rem' }}
          >
            {isLoading ? <><span className="spinner" /> Creating account...</> : 'Create account — it\'s free'}
          </button>

          <p className={styles.terms}>
            By joining, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>
          </p>
        </form>

        <div className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className={styles.footerLink}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
