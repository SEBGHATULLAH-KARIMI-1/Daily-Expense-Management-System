// آدرس بک‌اند: روی Netlify با متغیر VITE_API_URL تنظیم می‌شود (مثلاً https://expenses-api.onrender.com)
// روی کامپیوتر خودتان خالی می‌ماند و از proxy مربوط به Vite استفاده می‌شود.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'خطا در ارتباط با سرور')
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  getCategories: () => request('/categories'),
  addCategory: (name) => request('/categories', { method: 'POST', body: { name } }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getExpenses: () => request('/expenses'),
  addExpense: (data) => request('/expenses', { method: 'POST', body: data }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
}
