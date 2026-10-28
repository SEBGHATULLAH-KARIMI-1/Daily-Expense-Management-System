import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { useData } from '@/context/DataContext';
import { useI18n } from '@/context/I18nContext';
import { todayISO } from '@/lib/format';
import { NEW_CATEGORY, expenseFormSchema, type ExpenseFormOutput, type ExpenseFormValues } from '@/schemas/expense';
import type { Expense } from '@/types';

export function ExpenseForm({ initial, onDone }: { initial?: Expense; onDone: () => void }) {
  const { t } = useI18n();
  const { categories, expenses, addCategory, addExpense, editExpense } = useData();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initial
      ? {
          date: initial.date,
          name: initial.name,
          amount: initial.amount,
          categoryId: initial.categoryId,
          takenBy: initial.takenBy,
          description: initial.description,
        }
      : { date: todayISO(), name: '', amount: '', categoryId: categories[0]?.id ?? '', takenBy: '', description: '' },
  });

  const isNew = watch('categoryId') === NEW_CATEGORY;
  const people = [...new Set(expenses.map((e) => e.takenBy))];
  const err = (m?: string) => (m ? t(m) : undefined);

  const onSubmit = async (v: ExpenseFormOutput) => {
    let categoryId = v.categoryId;
    if (categoryId === NEW_CATEGORY) {
      const cat = await addCategory(v.newCategoryName ?? '');
      categoryId = cat.id;
    }
    const payload = {
      date: v.date,
      name: v.name,
      amount: v.amount,
      categoryId,
      takenBy: v.takenBy,
      description: v.description ?? '',
    };
    if (initial) await editExpense(initial.id, payload);
    else await addExpense(payload);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('form.date')} error={err(errors.date?.message)}>
          <Input type="date" {...register('date')} />
        </Field>
        <Field label={`${t('form.amount')} (${t('common.currency')})`} error={err(errors.amount?.message)}>
          <Input type="number" step="0.01" min="0" inputMode="decimal" {...register('amount')} />
        </Field>
      </div>

      <Field label={t('form.name')} error={err(errors.name?.message)}>
        <Input {...register('name')} />
      </Field>

      <Field label={t('form.category')} error={err(errors.categoryId?.message)}>
        <Select {...register('categoryId')}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>{t('form.newCategory')}</option>
        </Select>
      </Field>

      {isNew && (
        <Field label={t('form.newCategoryName')} error={err(errors.newCategoryName?.message)}>
          <Input autoFocus {...register('newCategoryName')} />
        </Field>
      )}

      <Field label={t('form.takenBy')} error={err(errors.takenBy?.message)}>
        <Input list="people" {...register('takenBy')} />
        <datalist id="people">
          {people.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </Field>

      <Field label={t('form.description')} error={err(errors.description?.message)}>
        <Textarea {...register('description')} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
