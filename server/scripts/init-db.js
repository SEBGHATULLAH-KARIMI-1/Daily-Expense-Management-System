import 'dotenv/config'
import pg from 'pg'
import pool from '../db.js'
import { ensureSchema } from '../migrate.js'

// فقط برای اجرای محلی: دیتابیس را می‌سازد (اگر نبود) و جدول‌ها را آماده می‌کند.
// روی Neon دیتابیس از قبل وجود دارد و سرور خودش جدول‌ها را می‌سازد.
const { DATABASE_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env

async function main() {
  if (!DATABASE_URL) {
    if (!/^[A-Za-z0-9_]+$/.test(DB_NAME || '')) throw new Error('DB_NAME نامعتبر است (فقط حروف انگلیسی، عدد و _)')

    const admin = new pg.Client({
      host: DB_HOST, port: Number(DB_PORT) || 5432, user: DB_USER, password: DB_PASSWORD, database: 'postgres',
    })
    await admin.connect()
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME])
    if (exists.rowCount === 0) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`)
      console.log(`✔ دیتابیس ${DB_NAME} ساخته شد`)
    } else {
      console.log(`• دیتابیس ${DB_NAME} از قبل وجود دارد`)
    }
    await admin.end()
  }

  await ensureSchema()
  console.log('✔ جدول‌ها آماده شدند')
  await pool.end()
}

main().catch((err) => {
  console.error('✘ خطا:', err.message)
  process.exit(1)
})
