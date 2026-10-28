import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { formatMoney, sum, totalsByCategory } from '@/lib/format';
import type { Filters } from '@/hooks/useFilteredExpenses';
import type { Expense } from '@/types';

/** محتوای قابل چاپ/ذخیره به صورت PDF (از طریق window.print) */
export function PrintReport({ items, filters }: { items: Expense[]; filters: Filters }) {
  const { t } = useI18n();
  const { categories } = useData();
  const cur = t('common.currency');
  const rows = totalsByCategory(items, categories);
  const period = `${filters.from || '…'}  →  ${filters.to || '…'}`;

  return (
    <article className="rounded-xl bg-white p-6 shadow-soft print:rounded-none print:p-0 print:shadow-none">
      <header className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold">{t('rep.heading')}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t('rep.period')}: <span dir="ltr">{period}</span>
        </p>
        <p className="mt-1 text-lg font-semibold">
          {t('common.total')}: {formatMoney(sum(items))} {cur}
        </p>
      </header>

      <h3 className="mb-2 font-semibold">{t('rep.byCategory')}</h3>
      <table className="mb-8 w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="px-3 py-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: r.color }} />{' '}
                {r.name}
              </td>
              <td className="px-3 py-1.5 text-slate-500">{r.count}</td>
              <td className="px-3 py-1.5 text-end font-medium">
                {formatMoney(r.total)} {cur}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mb-2 font-semibold">{t('rep.details')}</h3>
      <ExpenseTable items={items} />
    </article>
  );
}
