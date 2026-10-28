import { Field, Input, Select } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import type { Filters } from '@/hooks/useFilteredExpenses';

export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const { t } = useI18n();
  const { categories } = useData();
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Field label={t('common.search')}>
        <Input value={filters.q} onChange={(e) => set({ q: e.target.value })} />
      </Field>
      <Field label={t('filter.category')}>
        <Select value={filters.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
          <option value="">{t('common.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('filter.from')}>
        <Input type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
      </Field>
      <Field label={t('filter.to')}>
        <Input type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />
      </Field>
    </div>
  );
}
