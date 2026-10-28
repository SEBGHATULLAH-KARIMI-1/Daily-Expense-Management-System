import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { FileText, Languages, LayoutDashboard, Receipt, Tags, Wallet } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

const links = [
  { to: '/', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/expenses', key: 'nav.expenses', icon: Receipt },
  { to: '/categories', key: 'nav.categories', icon: Tags },
  { to: '/reports', key: 'nav.reports', icon: FileText },
];

export function Layout() {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="no-print border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-e">
        <div className="flex items-center justify-between gap-2 px-4 py-4 md:flex-col md:items-start md:gap-6">
          <div className="flex items-center gap-2 text-lg font-bold text-brand-700">
            <Wallet size={22} />
            {t('app.title')}
          </div>
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 md:hidden"
          >
            <Languages size={14} /> {lang === 'fa' ? 'EN' : 'فا'}
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:px-3">
          {links.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                )
              }
            >
              <Icon size={18} />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-3 pt-4 md:block">
          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Languages size={16} /> {lang === 'fa' ? 'English' : 'فارسی'}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
