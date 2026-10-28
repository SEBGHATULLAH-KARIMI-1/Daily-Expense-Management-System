import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Modal } from '@/components/ui';
import { CategoryPie, MonthlyBar } from '@/components/charts/Charts';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import { formatMoney, lastMonthsTotals, sum, todayISO, totalsByCategory } from '@/lib/format';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </Card>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const { expenses, categories, loading } = useData();
  const [open, setOpen] = useState(false);

  if (loading) return null;

  const today = todayISO();
  const month = today.slice(0, 7);
  const monthItems = expenses.filter((e) => e.date.startsWith(month));
  const byCat = totalsByCategory(monthItems, categories);
  const cur = t('common.currency');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.dashboard')}</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus size={18} /> {t('dash.addExpense')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('dash.thisMonth')} value={`${formatMoney(sum(monthItems))} ${cur}`} />
        <Stat label={t('dash.today')} value={`${formatMoney(sum(expenses.filter((e) => e.date === today)))} ${cur}`} />
        <Stat label={t('dash.count')} value={String(monthItems.length)} />
        <Stat label={t('dash.topCategory')} value={byCat[0]?.name ?? '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('dash.byCategory')}>
          <CategoryPie data={byCat} />
        </Card>
        <Card title={t('dash.monthly')}>
          <MonthlyBar data={lastMonthsTotals(expenses)} />
        </Card>
      </div>

      <Card title={t('dash.recent')}>
        <ExpenseTable items={expenses.slice(0, 5)} />
      </Card>

      {open && (
        <Modal title={t('exp.new')} onClose={() => setOpen(false)}>
          <ExpenseForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
