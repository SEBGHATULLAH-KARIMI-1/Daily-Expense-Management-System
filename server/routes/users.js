import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, isUuid } from '../utils.js'

const router = Router() // فقط مدیر (در server.js محافظت می‌شود)

// فهرست کاربران با آمار استفاده؛ مدیر مبلغ و جزئیات مصارف دیگران را نمی‌بیند
router.get('/', wrap(async (req, res) => {
  const { rows } = await query(`
    SELECT u.id, u.username, u.name, u.role,
           u.created_at AS "createdAt",
           COUNT(e.id)::int AS "expenseCount",
           MAX(e.created_at) AS "lastActivity"
    FROM users u
    LEFT JOIN expenses e ON e.created_by = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `)
  res.json(rows)
}))

// تعیین رمز جدید برای کاربری که رمزش را فراموش کرده
router.put('/:id', wrap(async (req, res) => {
  const { id } = req.params
  if (!isUuid(id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })

  const password = req.body.password || ''
  if (password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ حرف باشد' })

  const hash = await bcrypt.hash(password, 10)
  const r = await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id])
  if (r.rowCount === 0) return res.status(404).json({ error: 'کاربر پیدا نشد' })
  res.status(204).end()
}))

// حذف کاربر همراه با همهٔ مصارف و کتگوری‌هایش
router.delete('/:id', wrap(async (req, res) => {
  const { id } = req.params
  if (!isUuid(id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })
  if (id === req.user.id) return res.status(400).json({ error: 'حساب خودتان را نمی‌توانید حذف کنید' })

  await query('DELETE FROM expenses WHERE created_by = $1', [id])
  await query('DELETE FROM users WHERE id = $1', [id])
  res.status(204).end()
}))

export default router
