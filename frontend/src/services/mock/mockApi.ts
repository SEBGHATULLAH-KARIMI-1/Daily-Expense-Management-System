import type { Category, Expense, ExpenseInput } from '@/types';
import type { Api } from '@/services/api.types';

const EXP_KEY = 'mock.expenses';
const CAT_KEY = 'mock.categories';

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'غذا', color: PALETTE[0] },
  { id: 'cat-transport', name: 'ترانسپورت', color: PALETTE[1] },
  { id: 'cat-rent', name: 'کرایه', color: PALETTE[2] },
  { id: 'cat-utilities', name: 'برق و آب و انترنت', color: PALETTE[3] },
  { id: 'cat-salary', name: 'معاش', color: PALETTE[4] },
  { id: 'cat-supplies', name: 'لوازم دفتر', color: PALETTE[5] },
  { id: 'cat-other', name: 'متفرقه', color: PALETTE[6] },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function categories(): Category[] {
  const saved = read<Category[] | null>(CAT_KEY, null);
  if (saved) return saved;
  write(CAT_KEY, DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export const mockApi: Api = {
  async listExpenses() {
    return read<Expense[]>(EXP_KEY, []);
  },
  async createExpense(input: ExpenseInput) {
    const all = read<Expense[]>(EXP_KEY, []);
    const item: Expense = { ...input, id: uid(), createdAt: new Date().toISOString() };
    write(EXP_KEY, [item, ...all]);
    return item;
  },
  async updateExpense(id, input) {
    const all = read<Expense[]>(EXP_KEY, []);
    const idx = all.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error('Expense not found');
    const updated: Expense = { ...all[idx], ...input };
    all[idx] = updated;
    write(EXP_KEY, all);
    return updated;
  },
  async deleteExpense(id) {
    write(
      EXP_KEY,
      read<Expense[]>(EXP_KEY, []).filter((e) => e.id !== id),
    );
  },
  async listCategories() {
    return categories();
  },
  async createCategory(name, color) {
    const all = categories();
    const existing = all.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;
    const cat: Category = { id: uid(), name: name.trim(), color: color ?? PALETTE[all.length % PALETTE.length] };
    write(CAT_KEY, [...all, cat]);
    return cat;
  },
  async updateCategory(id, data) {
    const all = categories();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) throw new Error('Category not found');
    all[idx] = { ...all[idx], ...data, name: data.name.trim() };
    write(CAT_KEY, all);
    return all[idx];
  },
  async deleteCategory(id) {
    const used = read<Expense[]>(EXP_KEY, []).some((e) => e.categoryId === id);
    if (used) throw new Error('CATEGORY_IN_USE');
    write(
      CAT_KEY,
      categories().filter((c) => c.id !== id),
    );
  },
};
