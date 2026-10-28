import { z } from 'zod';

export const NEW_CATEGORY = '__new__';

export const expenseFormSchema = z
  .object({
    date: z.string().min(1, 'err.required'),
    name: z.string().trim().min(1, 'err.required').max(120),
    amount: z.coerce.number({ invalid_type_error: 'err.amount' }).positive('err.amount'),
    categoryId: z.string().min(1, 'err.required'),
    newCategoryName: z.string().trim().max(60).optional(),
    takenBy: z.string().trim().min(1, 'err.required').max(80),
    description: z.string().trim().max(500).optional().default(''),
  })
  .superRefine((v, ctx) => {
    if (v.categoryId === NEW_CATEGORY && !v.newCategoryName) {
      ctx.addIssue({ code: 'custom', path: ['newCategoryName'], message: 'err.required' });
    }
  });

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
export type ExpenseFormOutput = z.output<typeof expenseFormSchema>;
