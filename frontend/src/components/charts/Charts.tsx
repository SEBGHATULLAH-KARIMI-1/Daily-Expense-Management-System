import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '@/context/I18nContext';
import { formatMoney, type CategoryTotal } from '@/lib/format';

export function CategoryPie({ data }: { data: CategoryTotal[] }) {
  const { t } = useI18n();
  if (data.length === 0) return <p className="py-10 text-center text-sm text-slate-500">{t('common.noData')}</p>;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => formatMoney(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.id} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="font-medium">{formatMoney(d.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthlyBar({ data }: { data: { month: string; total: number }[] }) {
  return (
    <div className="h-64" dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={60} />
          <Tooltip formatter={(v: number) => formatMoney(v)} />
          <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
