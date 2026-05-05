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
    image: z.string().optional(),
    draft: z.boolean().default(false),
    era: z
      .enum(['founder', 'curator', 'journey', 'archive'])
      .default('founder'),
    post_track: z.enum(['daily-curator', 'weekly-orca']).optional(),
  }),
});

export const collections = { posts };
