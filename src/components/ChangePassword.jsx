import { useState } from 'react'
import { api } from '../api'

export default function ChangePassword({ onDone }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (next.length < 6) return setError('رمز جدید باید حداقل ۶ حرف باشد.')
    if (next !== confirm) return setError('تکرار رمز جدید با رمز جدید یکی نیست.')
    setBusy(true)
    setError('')
    try {
      await api.changePassword(current, next)
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        رمز فعلی
        <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" autoFocus dir="ltr" />
      </label>
      <label>
        رمز جدید
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" dir="ltr" />
      </label>
      <label>
        تکرار رمز جدید
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" dir="ltr" />
      </label>

      {error && <div className="error" role="alert">{error}</div>}

      <div className="actions">
        <button className="btn primary" type="submit" disabled={busy}>{busy ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}</button>
      </div>
    </form>
  )
}
