import { useState } from 'react'
import { Trash } from './Icons'

export default function CategoryManager({ categories, expenses, canDelete, onAdd, onDelete }) {
  const [name, setName] = useState('')

  const add = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  const count = (id) => expenses.filter((x) => x.categoryId === id).length

  return (
    <div>
      <form className="inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام کتگوری جدید" />
        <button className="btn primary" type="submit">افزودن</button>
      </form>

      <ul className="cat-manage">
        {categories.map((c) => (
          <li key={c.id}>
            <i style={{ background: c.color }} />
            <span className="grow">{c.name}</span>
            <small>{count(c.id)} مصرف</small>
            {canDelete && (
              <button
                className="icon-btn danger"
                disabled={count(c.id) > 0}
                title={count(c.id) > 0 ? 'کتگوری مصرف دارد و حذف نمی‌شود' : 'حذف'}
                aria-label={`حذف ${c.name}`}
                onClick={() => onDelete(c.id)}
              >
                <Trash />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
