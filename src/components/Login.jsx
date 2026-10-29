import { useState } from 'react'
import { api, setToken } from '../api'

const EMPTY = { name: '', username: '', password: '' }

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const switchMode = (m) => { setMode(m); setError(''); setForm(EMPTY) }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.username.trim() || !form.password) return setError('نام کاربری و رمز عبور را وارد کنید.')
    if (isRegister) {
      if (!form.name.trim()) return setError('نام خود را بنویسید.')
      if (form.password.length < 6) return setError('رمز عبور باید حداقل ۶ حرف باشد.')
    }

    setBusy(true)
    setError('')
    try {
      const { token, user } = isRegister
        ? await api.register({ name: form.name, username: form.username, password: form.password })
        : await api.login(form.username.trim(), form.password)
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
        <p>همهٔ خرج‌های روزانهٔ کسب‌وکار، یک جا؛ با کتگوری، گزارش ماهانه و خروجی PDF. اطلاعات هر حساب فقط برای صاحبش قابل دیدن است.</p>
      </aside>

      <form className="login-card" onSubmit={submit}>
        <h2>{isRegister ? 'ساخت حساب جدید' : 'ورود به حساب'}</h2>

        {isRegister && (
          <label>
            نام شما
            <input value={form.name} onChange={set('name')} autoComplete="name" autoFocus placeholder="مثلاً احمد" />
          </label>
        )}

        <label>
          نام کاربری
          <input
            value={form.username} onChange={set('username')} autoComplete="username"
            autoFocus={!isRegister} dir="ltr" placeholder="username"
          />
        </label>

        <label>
          رمز عبور
          <input
            type="password" value={form.password} onChange={set('password')}
            autoComplete={isRegister ? 'new-password' : 'current-password'} dir="ltr" placeholder="••••••••"
          />
        </label>

        {error && <div className="error" role="alert">{error}</div>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'لطفاً صبر کنید...' : isRegister ? 'ساخت حساب و ورود' : 'ورود'}
        </button>
        {busy && <p className="hint">اگر سرور خوابیده باشد، اولین بار تا یک دقیقه طول می‌کشد.</p>}

        <p className="switch">
          {isRegister ? 'حساب دارید؟' : 'حساب ندارید؟'}{' '}
          <button type="button" className="link-btn" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'وارد شوید' : 'ثبت‌نام کنید'}
          </button>
        </p>
      </form>
    </div>
  )
}
