import { useEffect, useState } from 'react'
import { api } from '../api'
import { Trash, Key } from './Icons'

const EMPTY = { name: '', username: '', password: '', role: 'user' }

export default function UserManager({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [resetId, setResetId] = useState(null)
  const [newPass, setNewPass] = useState('')

  useEffect(() => {
    api.getUsers().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const run = async (fn) => {
    try { setError(''); await fn() } catch (e) { setError(e.message) }
  }

  const add = (e) => {
    e.preventDefault()
    run(async () => {
      const created = await api.addUser(form)
      setUsers((list) => [...list, created])
      setForm(EMPTY)
    })
  }

  const changeRole = (u, role) =>
    run(async () => {
      const updated = await api.updateUser(u.id, { role })
      setUsers((list) => list.map((x) => (x.id === u.id ? updated : x)))
    })

  const savePass = (u) =>
    run(async () => {
      await api.updateUser(u.id, { password: newPass })
      setResetId(null)
      setNewPass('')
    })

  const remove = (u) => {
    if (!confirm(`کاربر «${u.name}» حذف شود؟ مصارفی که ثبت کرده می‌مانند.`)) return
    run(async () => {
      await api.deleteUser(u.id)
      setUsers((list) => list.filter((x) => x.id !== u.id))
    })
  }

  return (
    <div className="user-manager">
      <form className="user-form" onSubmit={add}>
        <h4>افزودن کاربر</h4>
        <div className="grid-2">
          <input placeholder="نام (مثلاً احمد)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="نام کاربری (انگلیسی)" dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="off" />
          <input placeholder="رمز عبور (حداقل ۶ حرف)" type="text" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="off" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">کاربر عادی</option>
            <option value="admin">مدیر</option>
          </select>
        </div>
        <button className="btn primary" type="submit">افزودن کاربر</button>
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      <h4>کاربران</h4>
      {loading && <p className="hint">در حال بارگذاری...</p>}
      <ul className="users">
        {users.map((u) => {
          const self = u.id === currentUser.id
          return (
            <li key={u.id}>
              <div className="user-row">
                <span className="avatar">{u.name.charAt(0).toUpperCase()}</span>
                <div className="grow">
                  <strong>{u.name}</strong>{self && <em className="you"> (شما)</em>}
                  <small dir="ltr">@{u.username}</small>
                </div>
                <select value={u.role} disabled={self} onChange={(e) => changeRole(u, e.target.value)} aria-label="نقش">
                  <option value="user">کاربر</option>
                  <option value="admin">مدیر</option>
                </select>
                <button className="icon-btn" title="تغییر رمز" aria-label="تغییر رمز" onClick={() => { setResetId(resetId === u.id ? null : u.id); setNewPass('') }}><Key /></button>
                <button className="icon-btn danger" title="حذف" aria-label="حذف" disabled={self} onClick={() => remove(u)}><Trash /></button>
              </div>
              {resetId === u.id && (
                <div className="inline-form reset">
                  <input dir="ltr" placeholder="رمز جدید (حداقل ۶ حرف)" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoFocus />
                  <button className="btn primary" onClick={() => savePass(u)}>ذخیره</button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
