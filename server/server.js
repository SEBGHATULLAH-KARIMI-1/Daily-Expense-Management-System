import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { query } from './db.js'
import { ensureSchema } from './migrate.js'
import { requireAuth, requireAdmin } from './auth.js'
import auth from './routes/auth.js'
import users from './routes/users.js'
import categories from './routes/categories.js'
import expenses from './routes/expenses.js'

const app = express()
const PORT = process.env.PORT || 5000

// پشت پروکسی Render، IP واقعی کاربر را درست بخوانیم (برای محدودیت تلاش ورود)
app.set('trust proxy', 1)

// آدرس سایت فرانت‌اند (Netlify). چند آدرس را با کاما جدا کنید. اگر خالی باشد همه مجازند (فقط برای توسعه).
const origins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(cors(origins.length ? { origin: origins } : undefined))
app.use(express.json())

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true, db: 'connected' })
  } catch {
    res.status(500).json({ ok: false, db: 'disconnected' })
  }
})

app.use('/api/auth', auth)
app.use('/api/users', requireAuth, requireAdmin, users)
app.use('/api/categories', requireAuth, categories)
app.use('/api/expenses', requireAuth, expenses)

// مدیریت خطاهای پیش‌بینی‌نشده
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'خطای سرور' })
})

ensureSchema()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('✘ راه‌اندازی ناموفق بود:', err.message)
    process.exit(1)
  })
