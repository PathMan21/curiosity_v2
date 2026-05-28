import { z } from "zod"

const stringOrArray = z.union([
  z.string(),
  z.array(z.string())
]).nullable().optional()


export const createPhotosSchema = z.object({
  unsplashId: z.string(),

  url: z.string().min(1).nullable().optional(),

  photographer: stringOrArray,

  thumb: z.string().optional(),

  description: z.string().nullable().optional(),

  photographerLink: z.string().url().nullable().optional(),

  type: z.string().default("Photo"),

  interest: z.string(),

  downloadLink: z.string().url().nullable().optional(),

})

