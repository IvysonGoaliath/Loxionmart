import { Link } from 'react-router-dom'
import { MapPin, ArrowUpRight, Store } from 'lucide-react'
import { categoryLabel } from '../../utils/format'
import { mediaUrl } from '../../utils/mall'
import SaveButton from './SaveButton'
export default function ShopCard({ shop }) {
  return <article className="mall-shop"><div className="mall-shop-top"><span className="mall-shop-avatar">{shop.logo_url ? <img src={mediaUrl(shop.logo_url)} alt="" width="56" height="56" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }}/>:<Store size={27}/>}</span><SaveButton kind="shop" id={shop.id} label={shop.name}/></div><span className="mall-eyebrow">{categoryLabel(shop.category)}</span><h3><Link to={`/business/${shop.slug}`}>{shop.name}</Link></h3><p>{shop.description}</p><div className="mall-shop-bottom"><span><MapPin size={14}/>{shop.location || 'Local shop'}</span><Link to={`/business/${shop.slug}`} aria-label={`Enter ${shop.name}`}><ArrowUpRight size={22}/></Link></div></article>
}
