import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { wrap, isUuid } from '../utils.js'

const router = Router() // فقط مدیر (در server.js محافظت می‌شود)

const COLUMNS = 'id, username, name, role, created_at AS "createdAt"'

router.get('/', wrap(async (req, res) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM users ORDER BY created_at`)
  res.json(rows)
}))

router.post('/', wrap(async (req, res) => {
  const username = (req.body.username || '').trim()
  const name = (req.body.name || '').trim()
  const password = req.body.password || ''
  const role = req.body.role === 'admin' ? 'admin' : 'user'

  if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username))
    return res.status(400).json({ error: 'نام کاربری باید ۳ تا ۳۰ حرف انگلیسی، عدد یا _ . - باشد' })
  if (!name) return res.status(400).json({ error: 'نام کاربر را بنویسید' })
  if (password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ حرف باشد' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (username, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [username, name, hash, role]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'این نام کاربری قبلاً استفاده شده است' })
    throw e
  }
}))

router.put('/:id', wrap(async (req, res) => {
  const { id } = req.params
  if (!isUuid(id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })

  const name = req.body.name !== undefined ? String(req.body.name).trim() : null
  const role = req.body.role !== undefined ? req.body.role : null
  const password = req.body.password || null

  if (name === '') return res.status(400).json({ error: 'نام نمی‌تواند خالی باشد' })
  if (role !== null && !['admin', 'user'].includes(role)) return res.status(400).json({ error: 'نقش نامعتبر است' })
  if (role !== null && id === req.user.id && role !== req.user.role)
    return res.status(400).json({ error: 'نقش حساب خودتان را نمی‌توانید تغییر دهید' })
  if (password !== null && password.length < 6) return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ حرف باشد' })

  const hash = password ? await bcrypt.hash(password, 10) : null
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), password_hash = COALESCE($3, password_hash)
     WHERE id = $4 RETURNING ${COLUMNS}`,
    [name, role, hash, id]
  )
  if (!rows.length) return res.status(404).json({ error: 'کاربر پیدا نشد' })
  res.json(rows[0])
}))

router.delete('/:id', wrap(async (req, res) => {
  const { id } = req.params
  if (!isUuid(id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })
  if (id === req.user.id) return res.status(400).json({ error: 'حساب خودتان را نمی‌توانید حذف کنید' })

  await query('DELETE FROM users WHERE id = $1', [id])
  res.status(204).end()
}))

export default router
