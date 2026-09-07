import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ExternalLink } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageLoader from '../components/common/PageLoader'
import EmptyState from '../components/common/EmptyState'
import api from '../utils/api'
import { formatPrice, formatDateTime, orderStatusLabel, orderStatusColor } from '../utils/format'
import styles from './MyOrdersPage.module.css'

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main id="mall-content" className={styles.main}>
        <div className="container">
          <h1 className={styles.title}>My Orders</h1>
          {loading ? <PageLoader /> : orders.length === 0 ? (
            <EmptyState
              emoji="🛍️"
              title="No orders yet"
              message="Browse local businesses and place your first order."
              action={<Link to="/browse" className="btn btn-primary">Browse businesses</Link>}
            />
          ) : (
            <div className={styles.list}>
              {orders.map(order => (
                <div key={order.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <div className={styles.orderId}>Order #{order.id}</div>
                      <div className={styles.orderDate}>{formatDateTime(order.created_at)}</div>
                    </div>
                    <span className={`badge ${orderStatusColor(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className={styles.items}>
                    {order.items?.map(item => (
                      <div key={item.id} className={styles.item}>
                        <span>{item.quantity}× item #{item.service_id}</span>
                        <span>{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cardFoot}>
                    <strong className={styles.total}>Total: {formatPrice(order.total_amount)}</strong>
                    {order.status === 'pending_payment' && order.ozow_payment_url && (
                      <a href={order.ozow_payment_url} target="_blank" rel="noopener noreferrer"
                         className="btn btn-green btn-sm">
                        <ExternalLink size={13} /> Pay now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
