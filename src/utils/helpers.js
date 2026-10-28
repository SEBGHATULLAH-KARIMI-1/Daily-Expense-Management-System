export const CURRENCY = 'افغانی' // واحد پول را اینجا تغییر دهید

export const MONTHS = [
  'جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون',
  'جولای', 'آگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر',
]

// getDay(): 0 = یکشنبه
export const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه']

const pad = (n) => String(n).padStart(2, '0')

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const monthKey = (dateStr) => (dateStr || '').slice(0, 7) // YYYY-MM
export const currentMonth = () => today().slice(0, 7)

export const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return `${MONTHS[Number(m) - 1]} ${y}`
}

export const daysInMonth = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export const dayLabel = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const wd = new Date(y, m - 1, d).getDay()
  return `${WEEKDAYS[wd]}، ${d} ${MONTHS[m - 1]}`
}

export const num = (n) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })

export const formatMoney = (n) => `${num(n)} ${CURRENCY}`

export const sum = (list) => list.reduce((s, e) => s + e.amount, 0)
