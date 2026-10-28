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

CREATE TABLE IF NOT EXISTS categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL,
  color TEXT NOT NULL
);

-- نام کتگوری بدون حساسیت به حروف یکتا باشد
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique ON categories (lower(name));

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

-- چه کسی این مصرف را ثبت کرده (برای دیتابیس‌های قدیمی هم اضافه می‌شود)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_id);
