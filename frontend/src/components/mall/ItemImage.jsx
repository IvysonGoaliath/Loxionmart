import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { mediaUrl } from '../../utils/mall'
export default function ItemImage({ url, name, eager = false, className = '' }) {
  const [failed, setFailed] = useState('')
  const src = mediaUrl(url)
  return src && failed !== src ? <img className={`mall-photo ${className}`} src={src} alt={name} width="600" height="600" loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(src)} /> : <div className={`mall-photo mall-no-photo ${className}`}><ImageIcon size={30} strokeWidth={1.3} aria-hidden="true"/><span>Photo coming soon</span></div>
}
