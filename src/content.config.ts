import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
      'ai-tech',
      'bisnes',
      'isu-semasa',
      'sains',
      'islam',
      'sejarah',
      'minda',
    ]),
    date: z.coerce.date(),
    description: z.string(),
    takeaways: z.array(z.string()),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
