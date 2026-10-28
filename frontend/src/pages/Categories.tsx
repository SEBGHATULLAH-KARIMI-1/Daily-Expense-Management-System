import { useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';

export default function Categories() {
  const { t } = useI18n();
  const { categories, addCategory, editCategory, removeCategory } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    await addCategory(name, color);
    setName('');
  };

  const save = async () => {
    if (editId && editName.trim()) await editCategory(editId, { name: editName, color: editColor });
    setEditId(null);
  };

  const remove = async (id: string) => {
    setError('');
    if (!window.confirm(t('common.confirmDelete'))) return;
    try {
      await removeCategory(id);
    } catch (e) {
      setError(e instanceof Error && e.message === 'CATEGORY_IN_USE' ? t('cat.inUse') : String(e));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t('cat.title')}</h1>

      <Card>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded border"
            aria-label={t('cat.color')}
          />
          <Input
            placeholder={t('cat.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <Button onClick={add}>
            <Plus size={18} /> {t('common.add')}
          </Button>
        </div>
      </Card>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Card>
        <ul className="divide-y">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              {editId === c.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded border"
                  />
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Button variant="ghost" onClick={save} aria-label={t('common.save')}>
                    <Check size={18} />
                  </Button>
                </>
              ) : (
                <>
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1 font-medium">{c.name}</span>
                  <button
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.name);
                      setEditColor(c.color);
                    }}
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                    aria-label={t('common.edit')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
