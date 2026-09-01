import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <div>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏪</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-800)', marginBottom: '0.5rem' }}>
            Page not found
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: '2rem' }}>
            Eish! This page doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">Back to Loxion Mart</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
