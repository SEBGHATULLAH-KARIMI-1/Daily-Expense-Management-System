import 'dotenv/config'
import pg from 'pg'

// در انتشار آنلاین (Neon) از DATABASE_URL استفاده می‌شود؛ روی کامپیوتر خودتان از DB_* در فایل .env
const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    }

const pool = new pg.Pool(config)

export const query = (text, params) => pool.query(text, params)

export default pool
