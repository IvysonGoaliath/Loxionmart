import { Link } from 'react-router-dom'
import { Clock3, MapPin } from 'lucide-react'
import { formatPrice } from '../../utils/format'
import ItemImage from './ItemImage'
import SaveButton from './SaveButton'
export default function ItemCard({ item, eager = false }) {
  const booking = item.service_type === 'booking'
  return <article className="mall-item"><div className="mall-item-visual"><Link to={`/item/${item.id}`} aria-label={`View ${item.name}`}><ItemImage url={item.image_urls?.[0]} name={item.name} eager={eager}/></Link><SaveButton id={item.id} label={item.name}/><span className="mall-type">{booking ? 'Book a service' : item.stock_quantity === 0 ? 'Out of stock' : 'Product'}</span></div><div className="mall-item-body"><Link className="mall-seller" to={`/business/${item.business.slug}`}>{item.business.name}</Link><h3><Link to={`/item/${item.id}`}>{item.name}</Link></h3><div className="mall-price">{formatPrice(item.price)}{booking && item.duration_minutes && <span><Clock3 size={13}/>{item.duration_minutes} min</span>}</div><p className="mall-item-location"><MapPin size={13}/>{item.business.location || 'Local shop'}</p></div></article>
}
