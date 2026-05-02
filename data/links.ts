import { db } from '@/db';
import { links } from '@/db/schema';
import { type Link } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getLinksByUser(userId: string): Promise<Link[]> {
  try {
    return await db.select().from(links).where(eq(links.userId, userId));
  } catch (error) {
    throw error;
  }
}
