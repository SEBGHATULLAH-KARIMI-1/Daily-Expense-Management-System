import { Router } from 'express'
import { query } from '../db.js'
import { wrap, isUuid } from '../utils.js'

const router = Router()

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b']

router.get('/', wrap(async (req, res) => {
  const { rows } = await query('SELECT id, name, color FROM categories ORDER BY name')
  res.json(rows)
}))

router.post('/', wrap(async (req, res) => {
  const name = (req.body.name || '').trim()
  if (!name) return res.status(400).json({ error: 'نام کتگوری لازم است' })

  // اگر از قبل وجود داشت، همان را برگردان
  const existing = await query('SELECT id, name, color FROM categories WHERE lower(name) = lower($1)', [name])
  if (existing.rowCount) return res.json(existing.rows[0])

  const { rows: cnt } = await query('SELECT COUNT(*)::int AS n FROM categories')
  const color = req.body.color || COLORS[cnt[0].n % COLORS.length]

  const { rows } = await query(
    `INSERT INTO categories (name, color) VALUES ($1, $2)
     ON CONFLICT ((lower(name))) DO UPDATE SET name = categories.name
     RETURNING id, name, color`,
    [name, color]
  )
  res.status(201).json(rows[0])
}))

router.delete('/:id', wrap(async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })

  const { rows } = await query('SELECT COUNT(*)::int AS n FROM expenses WHERE category_id = $1', [req.params.id])
  if (rows[0].n > 0) return res.status(409).json({ error: 'این کتگوری در مصارف استفاده شده است' })

  await query('DELETE FROM categories WHERE id = $1', [req.params.id])
  res.status(204).end()
}))

export default router
