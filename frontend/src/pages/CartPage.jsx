import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import EmptyState from '../components/common/EmptyState'
import api from '../utils/api'
import useCartStore from '../store/cartStore'
import { formatPrice } from '../utils/format'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, businessId, businessName, removeItem, updateQuantity, clearCart, total } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await api.post('/orders/', {
        business_id: businessId,
        items: items.map(i => ({ service_id: i.service.id, quantity: i.quantity })),
        notes: notes || undefined,
      })
      clearCart()
      const order = res.data
      if (order.ozow_payment_url) {
        toast.success('Order created! Redirecting to payment...')
        setTimeout(() => { window.location.href = order.ozow_payment_url }, 1200)
      } else {
        toast.success('Order placed!')
        navigate('/my-orders')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <EmptyState
            emoji="🛒"
            title="Your cart is empty"
            message="Add products or services from a business to get started."
            action={<Link to="/browse" className="btn btn-primary">Browse businesses</Link>}
          />
        </div>
      </main>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>Your cart</h1>
          <p className={styles.bizLabel}>From <strong>{businessName}</strong></p>

          <div className={styles.layout}>
            <div className={styles.items}>
              {items.map(({ service, quantity }) => (
                <div key={service.id} className={styles.item}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemEmoji}>{service.emoji}</span>
                    <div>
                      <div className={styles.itemName}>{service.name}</div>
                      <div className={styles.itemPrice}>{formatPrice(service.price)} each</div>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <div className={styles.qty}>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(service.id, quantity - 1)}>
                        <Minus size={13} />
                      </button>
                      <span className={styles.qtyNum}>{quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(service.id, quantity + 1)}>
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className={styles.itemTotal}>{formatPrice(service.price * quantity)}</div>
                    <button className={styles.removeBtn} onClick={() => removeItem(service.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order summary</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(total())}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Platform fee</span>
                <span className={styles.greenText}>Free</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>{formatPrice(total())}</span>
              </div>

              <div className="form-group" style={{ margin: '1rem 0' }}>
                <label className="form-label">Order notes (optional)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? <><span className="spinner spinner-white" /> Processing...</> : `Pay ${formatPrice(total())} via Ozow`}
              </button>

              <p className={styles.ozowNote}>Secure payment powered by Ozow 🔒</p>

              <button className={`btn btn-ghost btn-sm btn-full ${styles.clearBtn}`} onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
