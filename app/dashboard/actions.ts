'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createLink } from '@/data/links';

const createLinkSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9_-]*$/, 'Slug may only contain letters, numbers, hyphens, and underscores')
    .optional()
    .transform((val) => (val && val.trim() !== '' ? val : undefined)),
});

type CreateLinkInput = { url: string; slug?: string };

export async function createLinkAction(input: CreateLinkInput): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const result = createLinkSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const slug = result.data.slug ?? Math.random().toString(36).slice(2, 8);

  try {
    await createLink({ userId, url: result.data.url, slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create link';
    if (message.includes('unique') || message.includes('duplicate')) {
      return { error: 'That slug is already taken. Please choose another.' };
    }
    return { error: message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
