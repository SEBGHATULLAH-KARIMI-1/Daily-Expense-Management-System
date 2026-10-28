import { useState, useEffect } from 'react'

// داده‌ها فعلاً در مرورگر ذخیره می‌شوند؛ بعداً با API بک‌اند جایگزین می‌شود.
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  }, [key, value])

  return [value, setValue]
}
