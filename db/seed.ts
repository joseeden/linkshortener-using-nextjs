import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { links } from './schema';
import { type NewLink } from './schema';

const db = drizzle(process.env.DATABASE_URL!);

const userId = process.env.SEED_USER_ID!;

const seedLinks: NewLink[] = [
  {
    userId,
    url: 'https://www.github.com/joseeden',
    slug: 'github',
  },
  {
    userId,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    slug: 'yt-video',
  },
  {
    userId,
    url: 'https://nextjs.org/docs',
    slug: 'nextjs-docs',
  },
  {
    userId,
    url: 'https://orm.drizzle.team/docs/overview',
    slug: 'drizzle-docs',
  },
  {
    userId,
    url: 'https://clerk.com/docs',
    slug: 'clerk-docs',
  },
  {
    userId,
    url: 'https://tailwindcss.com/docs',
    slug: 'tailwind-docs',
  },
  {
    userId,
    url: 'https://ui.shadcn.com/docs',
    slug: 'shadcn-docs',
  },
  {
    userId,
    url: 'https://neon.tech/docs',
    slug: 'neon-docs',
  },
  {
    userId,
    url: 'https://www.typescriptlang.org/docs/',
    slug: 'ts-docs',
  },
  {
    userId,
    url: 'https://www.radix-ui.com/primitives/docs/overview/introduction',
    slug: 'radix-docs',
  },
];

async function seed() {
  console.log('Seeding database...');
  await db.insert(links).values(seedLinks);
  console.log(`Inserted ${seedLinks.length} rows into links table.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
