import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DataProvider } from '@/context/DataContext';
import { I18nProvider } from '@/context/I18nContext';
import Categories from '@/pages/Categories';
import Dashboard from '@/pages/Dashboard';
import Expenses from '@/pages/Expenses';
import Reports from '@/pages/Reports';

export default function App() {
  return (
    <I18nProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="categories" element={<Categories />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </I18nProvider>
  );
}
