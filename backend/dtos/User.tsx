import { z } from 'zod'

export const createUserSchema = z.object({
  id: z.number().int().positive().optional(),

  username: z
    .string()
    .min(3, 'Username trop court')
    .max(50, 'Username trop long')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Username invalide (caractères alphanumériques seulement)'),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[@$!%*?&]/, 'Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)'),

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
    .nullable()
    .optional(),

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
    .regex(/^[a-zA-Z0-9 ]*$/, 'Username invalide')
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

