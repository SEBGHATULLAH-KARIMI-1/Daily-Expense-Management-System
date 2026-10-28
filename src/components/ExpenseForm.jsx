import { useState } from 'react'
import { today, CURRENCY } from '../utils/helpers'

const NEW = '__new__'

export default function ExpenseForm({ categories, initial, people = [], onSave, onAddCategory, onCancel }) {
  const [form, setForm] = useState(
    initial || { date: today(), name: '', amount: '', categoryId: categories[0]?.id || NEW, takenBy: '', note: '' }
  )
  const [newCat, setNewCat] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!(Number(form.amount) > 0)) return setError('مبلغ باید بزرگتر از صفر باشد.')
    if (!form.name.trim()) return setError('اسم مصرف را بنویسید.')

    setSaving(true)
    try {
      let categoryId = form.categoryId
      if (categoryId === NEW) {
        if (!newCat.trim()) { setSaving(false); return setError('نام کتگوری جدید را بنویسید.') }
        categoryId = await onAddCategory(newCat.trim())
      }
      await onSave({
        date: form.date,
        name: form.name.trim(),
        amount: Number(form.amount),
        categoryId,
        takenBy: form.takenBy,
        note: form.note,
      })
    } catch {
      /* خطا در صفحهٔ اصلی نمایش داده می‌شود */
    }
    setSaving(false)
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="amount-field">
        <span>مبلغ</span>
        <div>
          <input
            type="number" min="0" step="any" inputMode="decimal" autoFocus
            value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0"
          />
          <em>{CURRENCY}</em>
        </div>
      </label>

      <div className="row">
        <label>
          اسم مصرف
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="مثلاً خرید برنج" />
        </label>
        <label className="narrow">
          تاریخ
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </label>
      </div>

      <fieldset>
        <legend>کتگوری</legend>
        <div className="chips">
          {categories.map((c) => (
            <button
              type="button" key={c.id}
              className={'chip' + (form.categoryId === c.id ? ' on' : '')}
              onClick={() => set('categoryId', c.id)}
              aria-pressed={form.categoryId === c.id}
            >
              <i style={{ background: c.color }} />{c.name}
            </button>
          ))}
          <button
            type="button"
            className={'chip dashed' + (form.categoryId === NEW ? ' on' : '')}
            onClick={() => set('categoryId', NEW)}
          >
            ＋ کتگوری جدید
          </button>
        </div>
        {form.categoryId === NEW && (
          <input
            className="mt" value={newCat} onChange={(e) => setNewCat(e.target.value)}
            placeholder="نام کتگوری جدید" autoFocus
          />
        )}
      </fieldset>

      <label>
        شخص برداشت‌کننده
        <input
          list="people" value={form.takenBy} onChange={(e) => set('takenBy', e.target.value)}
          placeholder="چه کسی پول را برداشت؟"
        />
        <datalist id="people">{people.map((p) => <option key={p} value={p} />)}</datalist>
      </label>

      <label>
        توضیحات
        <textarea rows="2" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="اختیاری" />
      </label>

      {error && <div className="error" role="alert">{error}</div>}

      <div className="actions">
        <button type="submit" className="btn primary" disabled={saving}>{saving ? 'در حال ذخیره...' : 'ذخیره مصرف'}</button>
        <button type="button" className="btn quiet" onClick={onCancel}>لغو</button>
      </div>
    </form>
  )
}
