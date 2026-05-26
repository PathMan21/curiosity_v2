import { z } from "zod"

const stringOrArray = z.union([
  z.string(),
  z.array(z.string())
]).nullable().optional()

export const createArticleSchema = z.object({
  openAlexId: z.string(),

  title: z.string().min(1),

  authors: stringOrArray,

  published: z.string(),

  summary: z.string().nullable().optional(),

  doi: z.string().nullable().optional(),

  pdfUrl: z.string().url().nullable().optional(),

  isOpenAccess: z.boolean(),

  publicationYear: z.number(),

  type: z.string(),

  link: z.string().url().nullable().optional(),

  mainTopic: z.string(),

  topicScore: z.number(),

  concepts: stringOrArray,

  subfield: z.string(),
})