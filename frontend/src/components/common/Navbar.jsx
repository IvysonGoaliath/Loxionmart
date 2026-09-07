import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Heart, UserRound, Menu, X, Store } from 'lucide-react'
import BrandLogo from './BrandLogo'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import { categories } from '../../utils/mall'
export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore()
  const count = useCartStore(s => s.count())
  const [open, setOpen] = useState(false), [query, setQuery] = useState('')
  const navigate = useNavigate(), location = useLocation()
  useEffect(() => { setOpen(false) }, [location.pathname, location.search])
  const search = e => { e.preventDefault(); navigate(`/mall${query.trim() ? '?q='+encodeURIComponent(query.trim()) : ''}`) }
  return <><a className="mall-skip" href="#mall-content">Skip to content</a><div className="mall-topline"><div className="container"><span>Shop Local, Shop Lekker!</span><Link to="/sell">Open your shop <Store size={13}/></Link></div></div>
  <header className="mall-nav"><div className="container mall-nav-main"><Link to="/" aria-label="Loxion Mart home"><BrandLogo/></Link><form className="mall-nav-search" onSubmit={search} role="search"><Search size={19}/><input aria-label="Search the mall" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, services & shops"/><button type="submit" aria-label="Search"><Search size={19}/></button></form><div className="mall-nav-actions"><Link to="/saved" aria-label="Saved items and followed shops"><Heart size={21}/><span>Saved</span></Link><Link to="/cart" aria-label={`Basket, ${count} items`}><ShoppingBag size={21}/><span>Basket{count>0 ? ` (${count})` : ''}</span></Link><button type="button" aria-expanded={open} aria-controls="mall-account-nav" aria-label="Open account and navigation menu" onClick={() => setOpen(!open)}>{open?<X size={22}/>:<UserRound size={22}/>}<span>{user ? user.full_name.split(' ')[0] : 'Account'}</span></button></div></div>
  <nav className="container mall-departments" aria-label="Mall departments"><NavLink to="/mall">All departments</NavLink>{categories.map(c => <Link key={c.id} to={`/mall?category=${c.id}`}>{c.label}</Link>)}<Link to="/browse">Shops</Link></nav>
  {open && <nav className="mall-account-panel" id="mall-account-nav" aria-label="Account navigation"><Link to="/mall">Shop products & services</Link><Link to="/browse">Explore shops</Link><Link to="/saved">My saved collection</Link>{user ? <><Link to="/my-orders">My orders</Link><Link to="/my-bookings">My bookings</Link><Link to="/profile">My profile</Link><Link to="/merchant">My shop workspace</Link>{isAdmin()&&<Link to="/admin">Mall administration</Link>}<button onClick={() => { logout(); setOpen(false); navigate('/') }}>Sign out</button></>:<><Link to="/login" state={{ from: location.pathname+location.search }}>Sign in</Link><Link to="/register" state={{ from: location.pathname+location.search }}>Create an account</Link></>}</nav>}</header></>
}
