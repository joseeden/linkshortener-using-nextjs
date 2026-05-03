'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createLink, updateLink, deleteLink } from '@/data/links';
import { randomBytes } from 'crypto';

const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => {
      try {
        const { protocol } = new URL(url);
        return protocol === 'https:' || protocol === 'http:';
      } catch {
        return false;
      }
    },
    { message: 'Only http and https URLs are allowed' },
  );

const createLinkSchema = z.object({
  url: urlSchema,
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

  const slug = result.data.slug ?? randomBytes(4).toString('hex');

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

const updateLinkSchema = z.object({
  url: urlSchema,
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Slug may only contain letters, numbers, hyphens, and underscores'),
});

type UpdateLinkInput = { id: number; url: string; slug: string };

export async function updateLinkAction(input: UpdateLinkInput): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const result = updateLinkSchema.safeParse({ url: input.url, slug: input.slug });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await updateLink(input.id, userId, { url: result.data.url, slug: result.data.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update link';
    if (message.includes('unique') || message.includes('duplicate')) {
      return { error: 'That slug is already taken. Please choose another.' };
    }
    return { error: message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

type DeleteLinkInput = { id: number };

export async function deleteLinkAction(input: DeleteLinkInput): Promise<{ success: true } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const result = z.object({ id: z.number().int().positive() }).safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await deleteLink(result.data.id, userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete link';
    return { error: message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
