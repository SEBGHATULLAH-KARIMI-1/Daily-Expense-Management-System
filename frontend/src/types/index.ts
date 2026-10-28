export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  amount: number;
  categoryId: string;
  takenBy: string; // شخص برداشت‌کننده
  description: string;
  createdAt: string;
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

export type Lang = 'fa' | 'en';
