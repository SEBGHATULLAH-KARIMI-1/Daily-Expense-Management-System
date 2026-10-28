import { useEffect, useState } from 'react'
import { api, getToken, setToken, setUnauthorizedHandler } from './api'
import Login from './components/Login'
import Workspace from './Workspace'

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(!!getToken())
  const [bootError, setBootError] = useState('')

  const logout = () => { setToken(null); setUser(null) }

  const boot = () => {
    if (!getToken()) { setChecking(false); return }
    setChecking(true)
    setBootError('')
    api.me()
      .then(setUser)
      .catch((e) => {
        // 401 را setUnauthorizedHandler پاک می‌کند؛ خطای شبکه توکن را نگه می‌دارد
        if (e.status !== 401) setBootError('اتصال به سرور برقرار نشد. اگر سرور خوابیده باشد تا یک دقیقه طول می‌کشد.')
      })
      .finally(() => setChecking(false))
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
    boot()
  }, [])

  if (checking) return <div className="center-screen"><p>در حال اتصال به سرور...</p></div>

  if (bootError) {
    return (
      <div className="center-screen">
        <p>{bootError}</p>
        <button className="btn primary" onClick={boot}>تلاش دوباره</button>
        <button className="link-btn" onClick={logout}>خروج</button>
      </div>
    )
  }

  if (!user) return <Login onLogin={setUser} />

  return <Workspace key={user.id} user={user} onLogout={logout} />
}
