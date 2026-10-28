import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Modal } from '@/components/ui';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { FilterBar } from '@/components/expenses/FilterBar';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import { useFilteredExpenses } from '@/hooks/useFilteredExpenses';
import { formatMoney, sum } from '@/lib/format';
import type { Expense } from '@/types';

export default function Expenses() {
  const { t } = useI18n();
  const { removeExpense } = useData();
  const { items, filters, setFilters } = useFilteredExpenses();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [creating, setCreating] = useState(false);

  const onDelete = async (e: Expense) => {
    if (window.confirm(t('common.confirmDelete'))) await removeExpense(e.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('exp.title')}</h1>
        <Button onClick={() => setCreating(true)}>
          <Plus size={18} /> {t('exp.new')}
        </Button>
      </div>

      <Card>
        <FilterBar filters={filters} onChange={setFilters} />
      </Card>

      <Card>
        <ExpenseTable items={items} onEdit={setEditing} onDelete={onDelete} />
        <div className="mt-4 border-t pt-3 text-end text-sm font-semibold">
          {t('common.total')}: {formatMoney(sum(items))} {t('common.currency')}
        </div>
      </Card>

      {(creating || editing) && (
        <Modal
          title={editing ? t('exp.editTitle') : t('exp.new')}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        >
          <ExpenseForm
            initial={editing ?? undefined}
            onDone={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
