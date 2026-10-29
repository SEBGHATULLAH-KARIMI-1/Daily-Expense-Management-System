import { Router } from 'express'
import { query } from '../db.js'
import { wrap, isUuid } from '../utils.js'

const router = Router() // هر کاربر فقط کتگوری‌های خودش را می‌بیند و تغییر می‌دهد

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']

router.get('/', wrap(async (req, res) => {
  const { rows } = await query('SELECT id, name, color FROM categories WHERE user_id = $1 ORDER BY name', [req.user.id])
  res.json(rows)
}))

router.post('/', wrap(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) return res.status(400).json({ error: 'نام کتگوری لازم است' })

  // اگر از قبل وجود داشت، همان را برگردان
  const existing = await query(
    'SELECT id, name, color FROM categories WHERE user_id = $1 AND lower(name) = lower($2)',
    [req.user.id, name]
  )
  if (existing.rowCount) return res.json(existing.rows[0])

  const { rows: cnt } = await query('SELECT COUNT(*)::int AS n FROM categories WHERE user_id = $1', [req.user.id])
  const color = req.body.color || COLORS[cnt[0].n % COLORS.length]

  const { rows } = await query(
    `INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, (lower(name))) DO UPDATE SET name = categories.name
     RETURNING id, name, color`,
    [req.user.id, name, color]
  )
  res.status(201).json(rows[0])
}))

router.delete('/:id', wrap(async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })

  const { rows } = await query(
    'SELECT COUNT(*)::int AS n FROM expenses WHERE category_id = $1 AND created_by = $2',
    [req.params.id, req.user.id]
  )
  if (rows[0].n > 0) return res.status(409).json({ error: 'این کتگوری در مصارف استفاده شده است' })

  await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
  res.status(204).end()
}))

export default router
