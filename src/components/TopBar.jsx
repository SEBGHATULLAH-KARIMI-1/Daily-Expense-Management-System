import { useEffect, useRef, useState } from 'react'
import { Users, Key, LogOut } from './Icons'

export default function TopBar({ user, onUsers, onPassword, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const pick = (fn) => () => { setOpen(false); fn() }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        مدیریت مصارف
      </div>

      <div className="user-menu" ref={ref}>
        <button className="user-chip" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu">
          <span className="avatar">{(user.name || user.username).trim().charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
        </button>

        {open && (
          <div className="menu" role="menu">
            <div className="menu-head">
              <strong>{user.name}</strong>
              <small>{user.role === 'admin' ? 'مدیر' : 'کاربر'} · {user.username}</small>
            </div>
            {user.role === 'admin' && (
              <button role="menuitem" onClick={pick(onUsers)}><Users /> کاربران سامانه</button>
            )}
            <button role="menuitem" onClick={pick(onPassword)}><Key /> تغییر رمز عبور</button>
            <button role="menuitem" className="danger" onClick={pick(onLogout)}><LogOut /> خروج</button>
          </div>
        )}
      </div>
    </header>
  )
}
