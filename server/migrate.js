import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { query } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_CATEGORIES = [
  ['خوراک و غذا', '#ef4444'],
  ['کرایه', '#f59e0b'],
  ['معاش کارمندان', '#10b981'],
  ['برق و آب', '#3b82f6'],
  ['حمل و نقل', '#8b5cf6'],
  ['تعمیر و مواد', '#ec4899'],
  ['متفرقه', '#64748b'],
]

// جدول‌ها را می‌سازد (اگر نبودند) و کتگوری‌های پیش‌فرض را اضافه می‌کند. اجرای چندباره بی‌خطر است.
export async function ensureSchema() {
  await query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

  const { rows } = await query('SELECT COUNT(*)::int AS n FROM categories')
  if (rows[0].n === 0) {
    for (const [name, color] of DEFAULT_CATEGORIES) {
      await query('INSERT INTO categories (name, color) VALUES ($1, $2)', [name, color])
    }
    console.log('✔ کتگوری‌های پیش‌فرض اضافه شدند')
  }
}
