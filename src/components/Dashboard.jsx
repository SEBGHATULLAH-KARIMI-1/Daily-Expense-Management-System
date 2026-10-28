import {
  CURRENCY, MONTHS, num, sum, today, currentMonth, shiftMonth, monthLabel, daysInMonth,
} from '../utils/helpers'
import { Plus, ChevronRight, ChevronLeft } from './Icons'

export default function Dashboard({
  month, onMonth, expenses, allExpenses, categories,
  catFilter, onCatFilter, onManage, onAdd,
}) {
  const isAll = !month
  const total = sum(expenses)

  // مقایسه با ماه قبل
  const prevTotal = isAll ? 0 : sum(allExpenses.filter((e) => e.date.slice(0, 7) === shiftMonth(month, -1)))
  const delta = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null

  const todayTotal = sum(allExpenses.filter((e) => e.date === today()))

  let avgDays
  if (isAll) avgDays = new Set(expenses.map((e) => e.date)).size || 1
  else avgDays = month === currentMonth() ? Number(today().slice(8)) : daysInMonth(month)
  const avg = total / avgDays

  const byCat = categories
    .map((c) => ({ ...c, sum: sum(expenses.filter((e) => e.categoryId === c.id)) }))
    .filter((c) => c.sum > 0)
    .sort((a, b) => b.sum - a.sum)

  // ستون‌های نمودار: روزهای ماه، یا ۱۲ ماه اخیر
  let bars
  if (!isAll) {
    const n = daysInMonth(month)
    const per = Array(n).fill(0)
    expenses.forEach((e) => { per[Number(e.date.slice(8, 10)) - 1] += e.amount })
    const todayDay = Number(today().slice(8))
    const monthName = MONTHS[Number(month.slice(5)) - 1]
    bars = per.map((v, i) => ({
      key: i + 1,
      value: v,
      label: i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : '',
      title: `${i + 1} ${monthName}: ${num(v)} ${CURRENCY}`,
      active: month === currentMonth() && i + 1 === todayDay,
    }))
  } else {
    const cur = currentMonth()
    bars = Array.from({ length: 12 }, (_, i) => {
      const k = shiftMonth(cur, i - 11)
      const v = sum(allExpenses.filter((e) => e.date.slice(0, 7) === k))
      return { key: k, value: v, label: String(Number(k.slice(5))), title: `${monthLabel(k)}: ${num(v)} ${CURRENCY}`, active: k === cur, go: k }
    })
  }
  const max = Math.max(...bars.map((b) => b.value), 1)

  return (
    <>
      <section className="hero">
        <div className="hero-top">
          <div className="month-nav">
            {!isAll && (
              <button className="nav-btn" onClick={() => onMonth(shiftMonth(month, -1))} aria-label="ماه قبل"><ChevronRight /></button>
            )}
            <span className="month-label">{isAll ? 'همه زمان‌ها' : monthLabel(month)}</span>
            {!isAll && (
              <button className="nav-btn" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="ماه بعد"><ChevronLeft /></button>
            )}
            <button className="nav-mode" onClick={() => onMonth(isAll ? currentMonth() : '')}>
              {isAll ? 'نمایش ماهانه' : 'نمایش همه'}
            </button>
          </div>
          <button className="btn accent" onClick={onAdd}><Plus /> افزودن مصرف</button>
        </div>

        <div className="hero-total">
          <span className="hero-caption">{isAll ? 'مجموع همه مصارف' : 'مجموع مصارف این ماه'}</span>
          <div className="hero-figure">
            <strong>{num(total)}</strong>
            <span>{CURRENCY}</span>
          </div>
          {delta !== null && (
            <span className={`delta ${delta > 0 ? 'up' : 'down'}`}>
              {delta === 0 ? 'برابر با ماه قبل' : `${Math.abs(delta)}٪ ${delta > 0 ? 'بیشتر' : 'کمتر'} از ماه قبل`}
            </span>
          )}
        </div>

        {total > 0 && (
          <div className="split" role="img" aria-label="سهم هر کتگوری">
            {byCat.map((c) => (
              <span key={c.id} style={{ flexGrow: c.sum, background: c.color }} title={`${c.name}: ${num(c.sum)} ${CURRENCY}`} />
            ))}
          </div>
        )}

        <dl className="stats">
          <div><dt>امروز</dt><dd>{num(todayTotal)}</dd></div>
          <div><dt>میانگین روزانه</dt><dd>{num(avg)}</dd></div>
          <div><dt>تعداد ثبت</dt><dd>{expenses.length}</dd></div>
        </dl>
      </section>

      <div className="insights">
        <section className="panel">
          <div className="panel-head">
            <h2>کتگوری‌ها</h2>
            <button className="link-btn" onClick={onManage}>مدیریت</button>
          </div>
          {byCat.length === 0 && <p className="hint">هنوز مصرفی در این بازه ثبت نشده است.</p>}
          <ul className="cats">
            {byCat.map((c) => (
              <li key={c.id}>
                <button
                  className={'cat-row' + (catFilter === c.id ? ' active' : '')}
                  onClick={() => onCatFilter(catFilter === c.id ? 'all' : c.id)}
                  aria-pressed={catFilter === c.id}
                >
                  <span className="cat-name">
                    <i style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="cat-sum">{num(c.sum)}</span>
                  <span className="cat-bar"><b style={{ width: `${(c.sum / total) * 100}%`, background: c.color }} /></span>
                  <span className="cat-pct">{Math.round((c.sum / total) * 100)}٪</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>{isAll ? 'مصرف ماهانه' : 'مصرف روزانه'}</h2>
            <span className="hint">بیشترین: {num(max === 1 && total === 0 ? 0 : max)} {CURRENCY}</span>
          </div>
          <div className="chart">
            {bars.map((b) => {
              const Tag = b.go ? 'button' : 'div'
              return (
                <Tag
                  key={b.key}
                  className={'col' + (b.active ? ' now' : '')}
                  title={b.title}
                  {...(b.go ? { onClick: () => onMonth(b.go), type: 'button' } : {})}
                >
                  <span className="fill" style={{ height: `${Math.max((b.value / max) * 100, b.value > 0 ? 3 : 0)}%` }} />
                  <span className="tick">{b.label}</span>
                </Tag>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
