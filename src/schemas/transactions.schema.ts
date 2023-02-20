import { z } from 'zod'

export const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'outcome']),
})

export type CreateTransactionBody = z.infer<typeof createTransactionBodySchema>
