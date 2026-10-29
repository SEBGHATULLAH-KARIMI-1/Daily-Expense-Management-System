import { CURRENCY, dayLabel, num, sum } from '../utils/helpers'
import { Search, Edit, Trash, Download, User, Close, Plus } from './Icons'

export default function ExpenseTable({
  expenses, getCategory, search, onSearch, catFilter, onClearCat,
  onEdit, onDelete, onPrint, onAdd,
}) {
  // گروه‌بندی بر اساس روز (لیست از قبل از جدید به قدیم مرتب است)
  const groups = []
  expenses.forEach((e) => {
    const last = groups[groups.length - 1]
    if (last && last.date === e.date) last.items.push(e)
    else groups.push({ date: e.date, items: [e] })
  })

  return (
    <section className="panel ledger">
      <div className="ledger-head">
        <div className="ledger-title">
          <h2>دفتر مصارف</h2>
          <span className="count">{expenses.length} ثبت</span>
          {catFilter !== 'all' && (
            <button className="filter-pill" onClick={onClearCat}>
              <i style={{ background: getCategory(catFilter).color }} />
              {getCategory(catFilter).name}
              <Close width={14} height={14} />
            </button>
          )}
        </div>
        <div className="ledger-tools">
          <label className="search">
            <Search />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="جستجو در اسم، شخص یا توضیحات"
            />
          </label>
          <button className="btn quiet" onClick={onPrint} disabled={!expenses.length}>
            <Download /> دانلود PDF
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty">
          <p>مصرفی برای نمایش وجود ندارد.</p>
          <button className="btn primary" onClick={onAdd}><Plus /> ثبت اولین مصرف</button>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.date} className="day">
            <div className="day-head">
              <span>{dayLabel(g.date)}</span>
              <span className="day-total">{num(sum(g.items))} {CURRENCY}</span>
            </div>
            <ul>
              {g.items.map((e) => {
                const cat = getCategory(e.categoryId)
                return (
                  <li key={e.id} className="entry" style={{ '--cat': cat.color }}>
                    <span className="entry-mark" />
                    <div className="entry-main">
                      <div className="entry-title">{e.name}</div>
                      <div className="entry-meta">
                        <span className="tag">{cat.name}</span>
                        {e.takenBy && <span className="who"><User width={14} height={14} />{e.takenBy}</span>}
                        {e.note && <span className="entry-note" title={e.note}>{e.note}</span>}
                      </div>
                    </div>
                    <div className="entry-amount">{num(e.amount)}<small>{CURRENCY}</small></div>
                    <div className="entry-actions">
                      <button className="icon-btn" onClick={() => onEdit(e)} aria-label="ویرایش"><Edit /></button>
                      <button className="icon-btn danger" onClick={() => onDelete(e.id)} aria-label="حذف"><Trash /></button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
