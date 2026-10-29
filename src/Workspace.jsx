import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { currentMonth, monthLabel } from './utils/helpers'
import TopBar from './components/TopBar'
import Dashboard from './components/Dashboard'
import ExpenseTable from './components/ExpenseTable'
import ExpenseForm from './components/ExpenseForm'
import CategoryManager from './components/CategoryManager'
import UserManager from './components/UserManager'
import ChangePassword from './components/ChangePassword'
import Modal from './components/Modal'
import PrintReport from './components/PrintReport'
import { Plus } from './components/Icons'

const FALLBACK = { id: 'none', name: 'بدون کتگوری', color: '#94a3b8' }

export default function Workspace({ user, onLogout }) {
  const isAdmin = user.role === 'admin'

  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [month, setMonth] = useState(currentMonth()) // '' = همه زمان‌ها
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catOpen, setCatOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(false)
  const [passOpen, setPassOpen] = useState(false)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getExpenses()])
      .then(([c, e]) => { setCategories(c); setExpenses(e) })
      .catch((e) => { if (e.status !== 401) setError('اتصال به سرور برقرار نشد. چند لحظه بعد دوباره امتحان کنید.') })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const getCategory = useCallback((id) => categories.find((c) => c.id === id) || FALLBACK, [categories])

  const run = async (fn) => {
    try { setError(''); return await fn() } catch (e) { setError(e.message); throw e }
  }

  const addCategory = (name) =>
    run(async () => {
      const cat = await api.addCategory(name)
      setCategories((list) => (list.some((c) => c.id === cat.id) ? list : [...list, cat]))
      return cat.id
    })

  const deleteCategory = (id) =>
    run(async () => {
      await api.deleteCategory(id)
      setCategories((list) => list.filter((c) => c.id !== id))
      if (catFilter === id) setCatFilter('all')
    }).catch(() => {})

  const saveExpense = (data) =>
    run(async () => {
      if (editing) {
        const updated = await api.updateExpense(editing.id, data)
        setExpenses((list) => list.map((x) => (x.id === updated.id ? updated : x)))
        setToast('مصرف ویرایش شد')
      } else {
        const created = await api.addExpense(data)
        setExpenses((list) => [created, ...list])
        setToast('مصرف ثبت شد')
        // اگر مصرف در ماه دیگری ثبت شد، به همان ماه برو تا فوراً دیده شود
        if (month && created.date.slice(0, 7) !== month) setMonth(created.date.slice(0, 7))
      }
      setFormOpen(false)
      setEditing(null)
    })

  const deleteExpense = (id) => {
    if (!confirm('این مصرف حذف شود؟')) return
    run(async () => {
      await api.deleteExpense(id)
      setExpenses((list) => list.filter((x) => x.id !== id))
      setToast('مصرف حذف شد')
    }).catch(() => {})
  }

  const openNew = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (e) => { setEditing(e); setFormOpen(true) }
  const closeForm = useCallback(() => { setFormOpen(false); setEditing(null) }, [])
  const closeCats = useCallback(() => setCatOpen(false), [])
  const closeUsers = useCallback(() => setUsersOpen(false), [])
  const closePass = useCallback(() => setPassOpen(false), [])

  // مصارف بازهٔ انتخاب‌شده (برای داشبورد)
  const inRange = useMemo(
    () => (month ? expenses.filter((e) => e.date.slice(0, 7) === month) : expenses),
    [expenses, month]
  )

  // با فیلتر کتگوری و جستجو (برای دفتر مصارف)
  const filtered = useMemo(() => {
    const q = search.trim()
    return inRange
      .filter((e) => catFilter === 'all' || e.categoryId === catFilter)
      .filter((e) => !q || [e.name, e.takenBy, e.note].some((f) => (f || '').includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [inRange, catFilter, search])

  const people = useMemo(() => [...new Set(expenses.map((e) => e.takenBy).filter(Boolean))], [expenses])

  const reportTitle = [
    month ? `ماه: ${monthLabel(month)}` : 'همه زمان‌ها',
    catFilter !== 'all' ? `کتگوری: ${getCategory(catFilter).name}` : 'همه کتگوری‌ها',
  ].join(' | ')

  return (
    <>
      <div className="app">
        <main className="page">
          <TopBar
            user={user}
            onUsers={() => setUsersOpen(true)}
            onPassword={() => setPassOpen(true)}
            onLogout={onLogout}
          />

          {error && <div className="banner" role="alert">{error}</div>}

          {loading ? (
            <div className="loading">در حال بارگذاری...</div>
          ) : (
            <>
              <Dashboard
                month={month}
                onMonth={setMonth}
                expenses={inRange}
                allExpenses={expenses}
                categories={categories}
                catFilter={catFilter}
                onCatFilter={setCatFilter}
                onManage={() => setCatOpen(true)}
                onAdd={openNew}
              />

              <ExpenseTable
                expenses={filtered}
                getCategory={getCategory}
                search={search}
                onSearch={setSearch}
                catFilter={catFilter}
                onClearCat={() => setCatFilter('all')}
                onEdit={openEdit}
                onDelete={deleteExpense}
                onPrint={() => window.print()}
                onAdd={openNew}
              />
            </>
          )}
        </main>

        {!loading && categories.length > 0 && (
          <button className="fab" onClick={openNew} aria-label="افزودن مصرف"><Plus width={26} height={26} /></button>
        )}

        {formOpen && (
          <Modal title={editing ? 'ویرایش مصرف' : 'مصرف جدید'} onClose={closeForm}>
            <ExpenseForm
              categories={categories}
              initial={editing}
              people={people}
              onSave={saveExpense}
              onAddCategory={addCategory}
              onCancel={closeForm}
            />
          </Modal>
        )}

        {catOpen && (
          <Modal title="مدیریت کتگوری‌ها" onClose={closeCats}>
            <CategoryManager
              categories={categories}
              expenses={expenses}
              canDelete
              onAdd={(name) => addCategory(name).catch(() => {})}
              onDelete={deleteCategory}
            />
          </Modal>
        )}

        {usersOpen && isAdmin && (
          <Modal title="کاربران سامانه" onClose={closeUsers} wide>
            <UserManager currentUser={user} />
          </Modal>
        )}

        {passOpen && (
          <Modal title="تغییر رمز عبور" onClose={closePass}>
            <ChangePassword onDone={() => { closePass(); setToast('رمز عبور تغییر کرد') }} />
          </Modal>
        )}

        {toast && <div className="toast" role="status">{toast}</div>}
      </div>

      <PrintReport expenses={filtered} categories={categories} getCategory={getCategory} title={reportTitle} />
    </>
  )
}
