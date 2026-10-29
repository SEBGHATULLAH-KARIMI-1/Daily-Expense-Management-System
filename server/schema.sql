CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- نام کاربری بدون حساسیت به حروف یکتا باشد
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (lower(username));

-- هر کاربر کتگوری‌های مخصوص خودش را دارد
CREATE TABLE IF NOT EXISTS categories (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  color   TEXT NOT NULL
);

-- برای دیتابیس‌های قدیمی (نسخهٔ مشترک)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
DROP INDEX IF EXISTS categories_name_unique;
CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_unique ON categories (user_id, lower(name));

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE NOT NULL,
  name        TEXT NOT NULL,
  amount      NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  taken_by    TEXT NOT NULL DEFAULT '',
  note        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- صاحب مصرف
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE CASCADE;

-- اگر قبلاً با SET NULL ساخته شده بود، به CASCADE تغییر بده
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_created_by_fkey' AND confdeltype <> 'c') THEN
    ALTER TABLE expenses DROP CONSTRAINT expenses_created_by_fkey;
    ALTER TABLE expenses ADD CONSTRAINT expenses_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_owner ON expenses (created_by);
