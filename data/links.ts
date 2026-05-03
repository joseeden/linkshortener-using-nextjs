import { db } from '@/db';
import { links } from '@/db/schema';
import { type Link, type NewLink } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function getLinksByUser(userId: string): Promise<Link[]> {
  try {
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt));
  } catch (error) {
    throw error;
  }
}

export async function createLink(data: Omit<NewLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    await db.insert(links).values(data);
  } catch (error) {
    throw error;
  }
}

export async function updateLink(id: number, userId: string, data: { url: string; slug: string }): Promise<void> {
  try {
    await db.update(links).set(data).where(and(eq(links.id, id), eq(links.userId, userId)));
  } catch (error) {
    throw error;
  }
}

export async function deleteLink(id: number, userId: string): Promise<void> {
  try {
    await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)));
  } catch (error) {
    throw error;
  }
}
