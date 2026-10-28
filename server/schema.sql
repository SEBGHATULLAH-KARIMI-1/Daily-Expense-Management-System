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

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_id);
