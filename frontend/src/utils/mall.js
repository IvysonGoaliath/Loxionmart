import api from './api'
export const categories = [
  { id: 'hair_beauty', label: 'Hair & Beauty', emoji: '✂️' },
  { id: 'phones_tech', label: 'Phones & Tech', emoji: '📱' },
  { id: 'food_catering', label: 'Food & Catering', emoji: '🍲' },
  { id: 'home_services', label: 'Home Services', emoji: '🔧' },
  { id: 'fashion', label: 'Fashion', emoji: '👕' },
  { id: 'other', label: 'More local', emoji: '🏪' },
]
export function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('/api/media/')) return `${api.defaults.baseURL.replace(/\/api$/, '')}${url}`
  return url.startsWith('https://') ? url : ''
}
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const detail = err.response?.data?.detail
  return typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(x => `${x.loc?.slice(1).join(' ')}: ${x.msg}`).join('. ') : fallback
}
export function rememberItem(id) {
  try { const list = JSON.parse(localStorage.getItem('loxion-recent') || '[]'); localStorage.setItem('loxion-recent', JSON.stringify([id, ...list.filter(x => x !== id)].slice(0, 8))) } catch {}
}
export function recentIds() { try { const ids = JSON.parse(localStorage.getItem('loxion-recent') || '[]'); return Array.isArray(ids) ? ids.filter(Number.isInteger).slice(0,8) : [] } catch { return [] } }
export function whatsappLink(shop, message) { const phone = (shop.whatsapp_number || '').replace(/[^0-9]/g, ''); return phone ? `https://wa.me/${phone.startsWith('0') ? '27' + phone.slice(1) : phone}?text=${encodeURIComponent(message)}` : '' }
