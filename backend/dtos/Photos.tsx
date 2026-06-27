import { z } from 'zod'

const stringOrArray = z
  .union([z.string(), z.array(z.string())])
  .nullable()
  .optional()

export const createPhotosSchema = z.object({
  unsplashId: z.string().min(1),

  url: z.string().url(),

  photographer: stringOrArray,

  thumb: z.string().optional(),

  description: z.string().nullable().optional(),

  photographerLink: z.string().url().nullable().optional(),

  type: z.literal('photo').default('photo'),

  interest: z.string(),

  downloadLink: z.string().url().nullable().optional(),
})
