import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';

export interface Filters {
  q: string;
  categoryId: string;
  from: string;
  to: string;
}

export function useFilteredExpenses() {
  const { expenses } = useData();
  const [filters, setFilters] = useState<Filters>({ q: '', categoryId: '', from: '', to: '' });

  const items = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return expenses
      .filter((e) => !filters.categoryId || e.categoryId === filters.categoryId)
      .filter((e) => !filters.from || e.date >= filters.from)
      .filter((e) => !filters.to || e.date <= filters.to)
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.takenBy.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [expenses, filters]);

  return { items, filters, setFilters };
}
