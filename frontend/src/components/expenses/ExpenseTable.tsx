import { Pencil, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import { formatMoney } from '@/lib/format';
import type { Expense } from '@/types';

export function CategoryBadge({ id }: { id: string }) {
  const { categoryById } = useData();
  const c = categoryById(id);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${c?.color ?? '#94a3b8'}22`, color: c?.color ?? '#475569' }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c?.color ?? '#94a3b8' }} />
      {c?.name ?? '—'}
    </span>
  );
}

export function ExpenseTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Expense[];
  onEdit?: (e: Expense) => void;
  onDelete?: (e: Expense) => void;
}) {
  const { t } = useI18n();
  if (items.length === 0) return <p className="py-8 text-center text-sm text-slate-500">{t('common.noData')}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-start text-slate-500">
            <th className="px-3 py-2 text-start font-medium">{t('form.date')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('form.name')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('form.category')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('form.takenBy')}</th>
            <th className="px-3 py-2 text-start font-medium">{t('form.amount')}</th>
            {(onEdit || onDelete) && <th className="px-3 py-2 text-start font-medium">{t('table.actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2" dir="ltr">
                {e.date}
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{e.name}</div>
                {e.description && <div className="max-w-xs truncate text-xs text-slate-500">{e.description}</div>}
              </td>
              <td className="px-3 py-2">
                <CategoryBadge id={e.categoryId} />
              </td>
              <td className="px-3 py-2">{e.takenBy}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold">{formatMoney(e.amount)}</td>
              {(onEdit || onDelete) && (
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(e)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label={t('common.edit')}
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(e)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
