import type { Category, Expense } from '@/types';

export const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);

export const sum = (items: Expense[]) => items.reduce((s, e) => s + e.amount, 0);

export interface CategoryTotal {
  id: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export function totalsByCategory(expenses: Expense[], categories: Category[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const e of expenses) {
    const cat = categories.find((c) => c.id === e.categoryId);
    const row = map.get(e.categoryId) ?? {
      id: e.categoryId,
      name: cat?.name ?? '—',
      color: cat?.color ?? '#94a3b8',
      total: 0,
      count: 0,
    };
    row.total += e.amount;
    row.count += 1;
    map.set(e.categoryId, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** مجموع ۶ ماه اخیر به شکل [{month:'2026-05', total}] */
export function lastMonthsTotals(expenses: Expense[], months = 6) {
  const now = new Date();
  const out: { month: string; total: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ month: key, total: 0 });
  }
  for (const e of expenses) {
    const row = out.find((r) => r.month === e.date.slice(0, 7));
    if (row) row.total += e.amount;
  }
  return out;
}
