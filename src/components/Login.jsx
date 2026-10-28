import { useState } from 'react'
import { api, setToken } from '../api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return setError('نام کاربری و رمز عبور را وارد کنید.')
    setBusy(true)
    setError('')
    try {
      const { token, user } = await api.login(username.trim(), password)
      setToken(token)
      onLogin(user)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <aside className="login-side">
        <div className="brand-mark" aria-hidden="true" />
        <h1>مدیریت مصارف</h1>
        <p>همهٔ خرج‌های روزانهٔ کسب‌وکار، یک جا؛ با کتگوری، گزارش ماهانه و خروجی PDF.</p>
      </aside>

      <form className="login-card" onSubmit={submit}>
        <h2>ورود به حساب</h2>

        <label>
          نام کاربری
          <input
            value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username" autoFocus dir="ltr" placeholder="username"
          />
        </label>

        <label>
          رمز عبور
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" dir="ltr" placeholder="••••••••"
          />
        </label>

        {error && <div className="error" role="alert">{error}</div>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'در حال ورود...' : 'ورود'}
        </button>
        {busy && <p className="hint">اگر سرور خوابیده باشد، اولین ورود تا یک دقیقه طول می‌کشد.</p>}
      </form>
    </div>
  )
}
