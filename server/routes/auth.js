import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap } from '../utils.js'
import { requireAuth, signToken, publicUser } from '../auth.js'
import { seedCategories } from '../migrate.js'

const router = Router()

// محدودیت ساده: ۱۰ تلاش ناموفق ورود در ۱۵ دقیقه برای هر IP
const attempts = new Map()
const WINDOW = 15 * 60 * 1000
const MAX = 10
const isLimited = (ip) => {
  const a = attempts.get(ip)
  return !!a && a.reset > Date.now() && a.count >= MAX
}
const recordFail = (ip) => {
  const a = attempts.get(ip)
  if (!a || a.reset < Date.now()) attempts.set(ip, { count: 1, reset: Date.now() + WINDOW })
  else a.count += 1
}

// محدودیت ثبت‌نام: حداکثر ۱۰ حساب جدید در ساعت برای هر IP (جلوگیری از اسپم)
const signups = new Map()
const SIGNUP_WINDOW = 60 * 60 * 1000
const SIGNUP_MAX = 10
const signupLimited = (ip) => {
  const s = signups.get(ip)
  return !!s && s.reset > Date.now() && s.count >= SIGNUP_MAX
}
const recordSignup = (ip) => {
  const s = signups.get(ip)
  if (!s || s.reset < Date.now()) signups.set(ip, { count: 1, reset: Date.now() + SIGNUP_WINDOW })
  else s.count += 1
}

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10)

// ثبت‌نام آزاد: هر کس برای خودش حساب می‌سازد و فوراً وارد می‌شود
router.post('/register', wrap(async (req, res) => {
  const ip = req.ip
  if (signupLimited(ip)) return res.status(429).json({ error: 'تعداد ثبت‌نام‌ها زیاد است. کمی بعد دوباره امتحان کنید' })

  const name = (req.body.name || '').trim()
  const username = (req.body.username || '').trim()
  const password = req.body.password || ''

  if (!name) return res.status(400).json({ error: 'نام خود را بنویسید' })
  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username))
    return res.status(400).json({ error: 'نام کاربری باید ۳ تا ۳۰ حرف انگلیسی، عدد یا _ . - باشد' })
  if (password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ حرف باشد' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (username, name, password_hash, role) VALUES ($1, $2, $3, 'user')
       RETURNING id, username, name, role`,
      [username, name, hash]
    )
    await seedCategories(rows[0].id)
    recordSignup(ip)
    res.status(201).json({ token: signToken(rows[0]), user: publicUser(rows[0]) })
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'این نام کاربری قبلاً استفاده شده است' })
    throw e
  }
}))

router.post('/login', wrap(async (req, res) => {
  const ip = req.ip
  if (isLimited(ip)) return res.status(429).json({ error: 'تلاش‌های زیاد. ۱۵ دقیقه دیگر دوباره امتحان کنید' })

  const username = (req.body.username || '').trim()
  const password = req.body.password || ''

  const { rows } = await query('SELECT * FROM users WHERE lower(username) = lower($1)', [username])
  const user = rows[0]
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH)

  if (!user || !ok) {
    recordFail(ip)
    return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است' })
  }

  attempts.delete(ip)
  res.json({ token: signToken(user), user: publicUser(user) })
}))

router.get('/me', requireAuth, (req, res) => {
  res.json(publicUser(req.user))
})

router.post('/change-password', requireAuth, wrap(async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body
  if (newPassword.length < 6) return res.status(400).json({ error: 'رمز جدید باید حداقل ۶ حرف باشد' })

  const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id])
  const ok = await bcrypt.compare(currentPassword, rows[0].password_hash)
  if (!ok) return res.status(400).json({ error: 'رمز فعلی درست نیست' })

  const hash = await bcrypt.hash(newPassword, 10)
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id])
  res.status(204).end()
}))

export default router
