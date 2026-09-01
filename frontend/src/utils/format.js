export const formatPrice = (amount) =>
  `R${Number(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

export const categoryLabel = (cat) => ({
  hair_beauty:    'Hair & Beauty',
  phones_tech:    'Phones & Tech',
  food_catering:  'Food & Catering',
  home_services:  'Home Services',
  fashion:        'Fashion',
  other:          'Other',
}[cat] || cat)

export const categoryEmoji = (cat) => ({
  hair_beauty:    '💇',
  phones_tech:    '📱',
  food_catering:  '🍲',
  home_services:  '🔧',
  fashion:        '👗',
  other:          '🏪',
}[cat] || '🏪')

export const orderStatusLabel = (status) => ({
  pending_payment: 'Awaiting Payment',
  paid:            'Paid',
  processing:      'Processing',
  completed:       'Completed',
  refunded:        'Refunded',
  cancelled:       'Cancelled',
}[status] || status)

export const orderStatusColor = (status) => ({
  pending_payment: 'badge-gray',
  paid:            'badge-green',
  processing:      'badge-green',
  completed:       'badge-green',
  refunded:        'badge-gray',
  cancelled:       'badge-red',
}[status] || 'badge-gray')

export const bookingStatusLabel = (status) => ({
  pending:   'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}[status] || status)

export const bookingStatusColor = (status) => ({
  pending:   'badge-gray',
  confirmed: 'badge-green',
  completed: 'badge-green',
  cancelled: 'badge-red',
}[status] || 'badge-gray')

export const truncate = (str, n = 100) =>
  str && str.length > n ? str.slice(0, n) + '...' : str
