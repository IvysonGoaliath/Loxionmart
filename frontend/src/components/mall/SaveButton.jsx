import { Heart } from 'lucide-react'
import { useSaved } from './SavedProvider'
export default function SaveButton({ kind = 'item', id, label, text = false }) {
  const saved = useSaved(), key = `${kind}:${id}`, active = saved.keys.includes(key)
  return <button type="button" className={`mall-save ${active ? 'is-saved' : ''} ${text ? 'with-text' : ''}`} aria-label={`${active ? 'Unsave' : 'Save'} ${label}`} aria-pressed={active} disabled={saved.pending.includes(key) || saved.loading} onClick={() => saved.toggle(kind, id)}><Heart size={19} fill={active ? 'currentColor' : 'none'} />{text && (kind === 'shop' ? active ? 'Following shop' : 'Follow shop' : active ? 'Saved' : 'Save item')}</button>
}
