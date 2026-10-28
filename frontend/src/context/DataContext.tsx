import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/services/api';
import type { Category, Expense, ExpenseInput } from '@/types';

interface DataValue {
  loading: boolean;
  expenses: Expense[];
  categories: Category[];
  categoryById: (id: string) => Category | undefined;
  addExpense: (input: ExpenseInput) => Promise<void>;
  editExpense: (id: string, input: ExpenseInput) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addCategory: (name: string, color?: string) => Promise<Category>;
  editCategory: (id: string, data: { name: string; color: string }) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [e, c] = await Promise.all([api.listExpenses(), api.listCategories()]);
    setExpenses(e);
    setCategories(c);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const value = useMemo<DataValue>(
    () => ({
      loading,
      expenses,
      categories,
      categoryById: (id) => categories.find((c) => c.id === id),
      addExpense: async (input) => {
        await api.createExpense(input);
        await reload();
      },
      editExpense: async (id, input) => {
        await api.updateExpense(id, input);
        await reload();
      },
      removeExpense: async (id) => {
        await api.deleteExpense(id);
        await reload();
      },
      addCategory: async (name, color) => {
        const cat = await api.createCategory(name, color);
        await reload();
        return cat;
      },
      editCategory: async (id, data) => {
        await api.updateCategory(id, data);
        await reload();
      },
      removeCategory: async (id) => {
        await api.deleteCategory(id);
        await reload();
      },
    }),
    [loading, expenses, categories, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
