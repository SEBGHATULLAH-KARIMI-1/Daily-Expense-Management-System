import { CURRENCY, formatMoney, num, sum } from '../utils/helpers'

// این بخش فقط هنگام چاپ / ذخیره به‌صورت PDF نمایش داده می‌شود.
export default function PrintReport({ expenses, categories, getCategory, title }) {
  const total = sum(expenses)
  const byCat = categories
    .map((c) => ({ name: c.name, sum: sum(expenses.filter((e) => e.categoryId === c.id)) }))
    .filter((c) => c.sum > 0)
    .sort((a, b) => b.sum - a.sum)

  return (
    <div className="print-report">
      <header>
        <h2>گزارش مصارف</h2>
        <p>{title}</p>
        <p>تاریخ گزارش: {new Date().toLocaleDateString('en-CA')}</p>
      </header>

      <table>
        <thead>
          <tr>
            <th>#</th><th>تاریخ</th><th>اسم</th><th>کتگوری</th><th>مبلغ</th><th>برداشت‌کننده</th><th>توضیحات</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, i) => (
            <tr key={e.id}>
              <td>{i + 1}</td>
              <td>{e.date}</td>
              <td>{e.name}</td>
              <td>{getCategory(e.categoryId).name}</td>
              <td>{formatMoney(e.amount)}</td>
              <td>{e.takenBy || '—'}</td>
              <td>{e.note || '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">مجموع</td>
            <td colSpan="3">{formatMoney(total)}</td>
          </tr>
        </tfoot>
      </table>

      <h3>خلاصه به تفکیک کتگوری</h3>
      <table className="summary">
        <tbody>
          {byCat.map((c) => (
            <tr key={c.name}>
              <td>{c.name}</td>
              <td>{num(c.sum)} {CURRENCY}</td>
              <td>{Math.round((c.sum / total) * 100)}٪</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
