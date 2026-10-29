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

// کتگوری‌های پیش‌فرض برای یک کاربر تازه
export async function seedCategories(userId) {
  for (const [name, color] of DEFAULT_CATEGORIES) {
    await query(
      'INSERT INTO categories (user_id, name, color) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, name, color]
    )
  }
}

// جدول‌ها و اولین مدیر را می‌سازد و داده‌های قدیمی (نسخهٔ مشترک) را به مدیر نسبت می‌دهد.
// اجرای چندباره بی‌خطر است.
export async function ensureSchema() {
  await query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))

  // اولین مدیر: فقط وقتی هیچ کاربری وجود ندارد، از ADMIN_USERNAME و ADMIN_PASSWORD ساخته می‌شود
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

  // داده‌های قدیمی بدون صاحب → مدیر
  const admin = (await query(`SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1`)).rows[0]
  if (admin) {
    await query('UPDATE categories SET user_id = $1 WHERE user_id IS NULL', [admin.id])
    await query('UPDATE expenses SET created_by = $1 WHERE created_by IS NULL', [admin.id])

    const own = await query('SELECT COUNT(*)::int AS n FROM categories WHERE user_id = $1', [admin.id])
    if (own.rows[0].n === 0) await seedCategories(admin.id)
  }

  // اگر مصرفی به کتگوری کاربر دیگری وصل است، برای صاحب مصرف یک کپی از کتگوری بساز و وصل کن
  await query(`
    INSERT INTO categories (user_id, name, color)
    SELECT DISTINCT e.created_by, c.name, c.color
    FROM expenses e JOIN categories c ON c.id = e.category_id
    WHERE c.user_id <> e.created_by
    ON CONFLICT (user_id, (lower(name))) DO NOTHING
  `)
  await query(`
    UPDATE expenses e SET category_id = c2.id
    FROM categories c1, categories c2
    WHERE e.category_id = c1.id AND c1.user_id <> e.created_by
      AND c2.user_id = e.created_by AND lower(c2.name) = lower(c1.name)
  `)
}
