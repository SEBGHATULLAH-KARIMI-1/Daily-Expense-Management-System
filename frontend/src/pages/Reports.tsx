import { Download } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { FilterBar } from '@/components/expenses/FilterBar';
import { PrintReport } from '@/components/reports/PrintReport';
import { useI18n } from '@/context/I18nContext';
import { useFilteredExpenses } from '@/hooks/useFilteredExpenses';

export default function Reports() {
  const { t } = useI18n();
  const { items, filters, setFilters } = useFilteredExpenses();

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('rep.title')}</h1>
        <Button onClick={() => window.print()}>
          <Download size={18} /> {t('rep.download')}
        </Button>
      </div>
      <p className="no-print -mt-3 text-sm text-slate-500">{t('rep.hint')}</p>

      <Card className="no-print">
        <FilterBar filters={filters} onChange={setFilters} />
      </Card>

      <PrintReport items={items} filters={filters} />
    </div>
  );
}
