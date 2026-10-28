import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { query } from './db.js'
import { wrap } from './utils.js'

const SECRET =
  process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-only-secret-change-me')

if (!SECRET) {
  console.error('✘ JWT_SECRET تنظیم نشده است (در Render یک متن تصادفی طولانی بگذارید).')
  process.exit(1)
}

export const signToken = (user) => jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' })

export const publicUser = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role })

// کاربر را از توکن می‌شناسد و هر بار از دیتابیس می‌خواند (کاربر حذف‌شده فوراً دسترسی‌اش را از دست می‌دهد)
export const requireAuth = wrap(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'لطفاً وارد شوید' })

  let payload
  try {
    payload = jwt.verify(token, SECRET)
  } catch {
    return res.status(401).json({ error: 'نشست شما تمام شده است. دوباره وارد شوید' })
  }

  const { rows } = await query('SELECT id, username, name, role FROM users WHERE id = $1', [payload.sub])
  if (!rows.length) return res.status(401).json({ error: 'حساب کاربری پیدا نشد' })

  req.user = rows[0]
  next()
})

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'فقط مدیر می‌تواند این کار را انجام دهد' })
  next()
}
