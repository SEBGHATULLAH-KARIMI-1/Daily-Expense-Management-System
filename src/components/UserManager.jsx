import { Fragment, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { Trash, Key } from './Icons'

const DAY = 24 * 60 * 60 * 1000

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-CA') : '—')

export default function UserManager({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resetId, setResetId] = useState(null)
  const [newPass, setNewPass] = useState('')

  useEffect(() => {
    api.getUsers().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const run = async (fn) => {
    try { setError(''); await fn() } catch (e) { setError(e.message) }
  }

  const stats = useMemo(() => {
    const now = Date.now()
    return {
      total: users.length,
      active: users.filter((u) => u.lastActivity && now - new Date(u.lastActivity).getTime() < 7 * DAY).length,
      today: users.filter((u) => now - new Date(u.createdAt).getTime() < DAY).length,
      expenses: users.reduce((s, u) => s + u.expenseCount, 0),
    }
  }, [users])

  const savePass = (u) =>
    run(async () => {
      await api.resetUserPassword(u.id, newPass)
      setResetId(null)
      setNewPass('')
    })

  const remove = (u) => {
    if (!confirm(`کاربر «${u.name}» همراه با همهٔ مصارف و کتگوری‌هایش برای همیشه حذف شود؟`)) return
    run(async () => {
      await api.deleteUser(u.id)
      setUsers((list) => list.filter((x) => x.id !== u.id))
    })
  }

  return (
    <div className="user-manager">
      <div className="mini-stats">
        <div><strong>{stats.total}</strong><span>کل کاربران</span></div>
        <div><strong>{stats.active}</strong><span>فعال در ۷ روز اخیر</span></div>
        <div><strong>{stats.today}</strong><span>ثبت‌نام ۲۴ ساعت اخیر</span></div>
        <div><strong>{stats.expenses}</strong><span>کل ثبت‌ها</span></div>
      </div>

      <p className="hint privacy">شما فقط آمار استفاده را می‌بینید؛ مبلغ و جزئیات مصارف هر کاربر برای شما نمایش داده نمی‌شود.</p>

      {error && <div className="error" role="alert">{error}</div>}
      {loading && <p className="hint">در حال بارگذاری...</p>}

      <div className="table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>کاربر</th>
              <th>عضویت</th>
              <th>تعداد ثبت</th>
              <th>آخرین فعالیت</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === currentUser.id
              return (
                <Fragment key={u.id}>
                  <tr>
                    <td>
                      <div className="user-cell">
                        <span className="avatar">{u.name.charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{u.name}</strong>
                          {u.role === 'admin' && <em className="role-badge">مدیر</em>}
                          {self && <em className="you"> (شما)</em>}
                          <small dir="ltr">@{u.username}</small>
                        </div>
                      </div>
                    </td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td>{u.expenseCount}</td>
                    <td>{fmtDate(u.lastActivity)}</td>
                    <td className="row-actions">
                      <button className="icon-btn" title="تعیین رمز جدید" aria-label="تعیین رمز جدید"
                        onClick={() => { setResetId(resetId === u.id ? null : u.id); setNewPass('') }}><Key /></button>
                      <button className="icon-btn danger" title="حذف" aria-label="حذف" disabled={self} onClick={() => remove(u)}><Trash /></button>
                    </td>
                  </tr>
                  {resetId === u.id && (
                    <tr className="reset-row">
                      <td colSpan="5">
                        <div className="inline-form reset">
                          <input dir="ltr" placeholder="رمز جدید (حداقل ۶ حرف)" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoFocus />
                          <button className="btn primary" onClick={() => savePass(u)}>ذخیره</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
