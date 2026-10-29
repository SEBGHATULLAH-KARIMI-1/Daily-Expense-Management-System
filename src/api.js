// آدرس بک‌اند: روی Netlify با VITE_API_URL (در netlify.toml) تنظیم می‌شود.
// روی کامپیوتر خودتان خالی می‌ماند و از proxy مربوط به Vite استفاده می‌شود.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'
const TOKEN_KEY = 'expenses_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

// وقتی سرور بگوید توکن معتبر نیست، App کاربر را به صفحهٔ ورود برمی‌گرداند
let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

async function request(path, options = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    const err = new Error('اتصال به سرور برقرار نشد')
    err.network = true
    throw err
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 && path !== '/auth/login') onUnauthorized()
    const err = new Error(data.error || 'خطا در ارتباط با سرور')
    err.status = res.status
    throw err
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  getUsers: () => request('/users'),
  resetUserPassword: (id, password) => request(`/users/${id}`, { method: 'PUT', body: { password } }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/categories'),
  addCategory: (name) => request('/categories', { method: 'POST', body: { name } }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getExpenses: () => request('/expenses'),
  addExpense: (data) => request('/expenses', { method: 'POST', body: data }),
  updateExpense: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
}
