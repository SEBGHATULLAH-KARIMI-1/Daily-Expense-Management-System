import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
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

// جدول‌ها، کتگوری‌های پیش‌فرض و اولین مدیر را می‌سازد. اجرای چندباره بی‌خطر است.
export async function ensureSchema() {
  await query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

  const cats = await query('SELECT COUNT(*)::int AS n FROM categories')
  if (cats.rows[0].n === 0) {
    for (const [name, color] of DEFAULT_CATEGORIES) {
      await query('INSERT INTO categories (name, color) VALUES ($1, $2)', [name, color])
    }
    console.log('✔ کتگوری‌های پیش‌فرض اضافه شدند')
  }

  // اولین مدیر: فقط وقتی هیچ کاربری وجود ندارد، از متغیرهای ADMIN_USERNAME و ADMIN_PASSWORD ساخته می‌شود
  const users = await query('SELECT COUNT(*)::int AS n FROM users')
  if (users.rows[0].n === 0) {
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 6) {
      throw new Error('هیچ کاربری وجود ندارد. ADMIN_USERNAME و ADMIN_PASSWORD (حداقل ۶ حرف) را در Environment تنظیم کنید.')
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await query(
      `INSERT INTO users (username, name, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
      [ADMIN_USERNAME.trim(), 'مدیر', hash]
    )
    console.log(`✔ کاربر مدیر "${ADMIN_USERNAME}" ساخته شد`)
  }
}
