import { Router } from 'express'
import { query } from '../db.js'
import { wrap, isUuid } from '../utils.js'

const router = Router() // هر کاربر فقط مصارف خودش را می‌بیند و تغییر می‌دهد

const SELECT = `
  SELECT e.id,
         to_char(e.date, 'YYYY-MM-DD') AS date,
         e.name,
         e.amount::float8              AS amount,
         e.category_id                 AS "categoryId",
         e.taken_by                    AS "takenBy",
         e.note
  FROM expenses e
`

async function validate(body, userId) {
  const name = (body.name || '').trim()
  const amount = Number(body.amount)
  if (!name) return 'اسم مصرف لازم است'
  if (!(amount > 0)) return 'مبلغ باید بزرگتر از صفر باشد'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date || '')) return 'تاریخ نامعتبر است'
  if (!isUuid(body.categoryId)) return 'کتگوری نامعتبر است'
  // کتگوری باید مال همین کاربر باشد
  const cat = await query('SELECT 1 FROM categories WHERE id = $1 AND user_id = $2', [body.categoryId, userId])
  if (!cat.rowCount) return 'کتگوری نامعتبر است'
  return null
}

const values = (b) => [
  b.date,
  b.name.trim(),
  Number(b.amount),
  b.categoryId,
  (b.takenBy || '').trim(),
  (b.note || '').trim(),
]

// GET /api/expenses?category=&month=YYYY-MM&q=
router.get('/', wrap(async (req, res) => {
  const { category, month, q } = req.query
  const params = [req.user.id]
  const where = ['e.created_by = $1']

  if (category && isUuid(category)) { params.push(category); where.push(`e.category_id = $${params.length}`) }
  if (month && /^\d{4}-\d{2}$/.test(month)) { params.push(month); where.push(`to_char(e.date, 'YYYY-MM') = $${params.length}`) }
  if (q) {
    params.push(`%${q}%`)
    const n = params.length
    where.push(`(e.name ILIKE $${n} OR e.taken_by ILIKE $${n} OR e.note ILIKE $${n})`)
  }

  const sql = `${SELECT} WHERE ${where.join(' AND ')} ORDER BY e.date DESC, e.created_at DESC`
  const { rows } = await query(sql, params)
  res.json(rows)
}))

router.post('/', wrap(async (req, res) => {
  const err = await validate(req.body, req.user.id)
  if (err) return res.status(400).json({ error: err })

  const { rows } = await query(
    `INSERT INTO expenses (date, name, amount, category_id, taken_by, note, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [...values(req.body), req.user.id]
  )
  const created = await query(`${SELECT} WHERE e.id = $1`, [rows[0].id])
  res.status(201).json(created.rows[0])
}))

router.put('/:id', wrap(async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })
  const err = await validate(req.body, req.user.id)
  if (err) return res.status(400).json({ error: err })

  const r = await query(
    `UPDATE expenses
     SET date = $1, name = $2, amount = $3, category_id = $4, taken_by = $5, note = $6
     WHERE id = $7 AND created_by = $8`,
    [...values(req.body), req.params.id, req.user.id]
  )
  if (r.rowCount === 0) return res.status(404).json({ error: 'پیدا نشد' })

  const updated = await query(`${SELECT} WHERE e.id = $1`, [req.params.id])
  res.json(updated.rows[0])
}))

router.delete('/:id', wrap(async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'شناسه نامعتبر است' })
  await query('DELETE FROM expenses WHERE id = $1 AND created_by = $2', [req.params.id, req.user.id])
  res.status(204).end()
}))

export default router
