import { z } from 'zod'

export const createUserSchema = z.object({
  id: z.number().int().positive().optional(),

  username: z
    .string()
    .min(3, 'Username trop court')
    .max(50, 'Username trop long'),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),

  email: z
    .string()
    .email('Email invalide'),

  picture: z
    .string()
    .url('URL invalide')
    .nullable()
    .optional(),

  interests: z
    .array(z.string())
    .max(10, "Trop d'intérêts") 
    .nullable(),

  verified: z
    .boolean()
    .default(false),

  isTemporary: z
    .boolean()
    .default(false),

  refreshToken: z
    .string()
    .nullable()
    .optional(),
})

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username trop court')
    .max(50, 'Username trop long')
    .optional(),

  email: z
    .string()
    .email('Email invalide')
    .optional(),

  picture: z
    .string()
    .url('URL invalide')
    .nullable()
    .optional(),

  interests: z
    .array(z.string())
    .max(10, "Trop d'intérêts") 
    .nullable()
    .optional(),
})
