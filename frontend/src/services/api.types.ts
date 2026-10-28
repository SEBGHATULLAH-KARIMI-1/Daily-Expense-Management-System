import type { Category, Expense, ExpenseInput } from '@/types';

/**
 * قرارداد سرویس داده. فعلاً با mock (localStorage) پیاده شده؛
 * بعد از ساخت بک‌اند فقط پیاده‌سازی http جایگزین می‌شود.
 */
export interface Api {
  listExpenses(): Promise<Expense[]>;
  createExpense(input: ExpenseInput): Promise<Expense>;
  updateExpense(id: string, input: ExpenseInput): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  listCategories(): Promise<Category[]>;
  createCategory(name: string, color?: string): Promise<Category>;
  updateCategory(id: string, data: { name: string; color: string }): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
