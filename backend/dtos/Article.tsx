import { z } from "zod";


export const createArticleSchema = z.object({
  openAlexId: z.string(),
  title: z.string().min(1),

  authors: z.union([
    z.string(),
    z.array(z.string())
    ]),

  published: z.string(),

  summary: z.string().optional(),

  doi: z.string().optional(),
  pdfUrl: z.string().url().optional(),

  isOpenAccess: z.boolean(),

  publicationYear: z.number(),

  type: z.string(),

  link: z.string().url(),

  mainTopic: z.string(),

  topicScore: z.number(),

  concepts: z.union([
    z.string(),
    z.array(z.string())
    ]),

  subfield: z.string(),
});