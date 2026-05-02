# Data Fetching

## Overview

This document covers conventions for fetching data in the dashboard page — specifically retrieving the list of links created by a user from the database.

Read this file before implementing any data fetching logic, adding helper functions to the `/data` directory, or rendering database results in a server component.

---

## Rules

### Component Type

- **ALWAYS use server components to fetch data.** Data fetching must execute on the server side to keep database queries out of the client bundle and away from the browser.
- **NEVER use client components for data fetching.** Do not add `"use client"` to any file that queries the database.
- **NEVER use `useAuth` or any other client-side Clerk hook to obtain the user ID.** Use the server-side Clerk helper (`auth()`) instead.

### The `/data` Directory

- **ALWAYS place helper functions for fetching data in the `/data` directory at the project root.** This directory sits alongside `app/`, `db/`, and `lib/` and must be created if it does not exist.
- Each file in `/data` is responsible for a specific domain (e.g., `data/links.ts` for link-related queries).
- These helpers can be imported and reused across any server component or server action in the project.

### ORM and Imports

- **All helper functions in `/data` must use Drizzle ORM.** Never use raw SQL strings or any other ORM.
- **Always import `db` from `@/db`** and table definitions (e.g., `links`) from `@/db/schema`. Use the `@/` path alias for every internal import — never use relative paths like `../../db`.

### Types

- **NEVER define custom TypeScript interfaces for database results.** Use the inferred types exported from `db/schema.ts` (`Link`, `NewLink`).
- **Never use `any`** for column types or query results.

### Schema Compliance

- **Each link object must only include fields defined in the actual schema.** The `links` table has: `id`, `userId`, `url`, `slug`, `createdAt`, `updatedAt`.
- **Do NOT reference or invent columns that are not in the schema.** There is no `clicks`, `views`, or any analytics column.

### Error Handling

- Helper functions must **throw errors** rather than swallowing them silently. Let the calling component handle the error appropriately.

### Async

- **Always use `async` functions** when fetching data to avoid blocking the main thread.

---

## Directory Structure

Create a `/data` directory at the project root:

```
data/
  links.ts     # Helper functions for link-related database queries
app/
db/
lib/
```

---

## Example: Fetching Links for a User

**`data/links.ts`** — server-only helper function:

```ts
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
```

**`app/dashboard/page.tsx`** — server component consuming the helper:

```tsx
import { auth } from '@clerk/nextjs/server';
import { getLinksByUser } from '@/data/links';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    // Handle unauthenticated state — redirect or render fallback
    return null;
  }

  const links = await getLinksByUser(userId);

  return (
    <ul>
      {links.map((link) => (
        <li key={link.id}>{link.slug} → {link.url}</li>
      ))}
    </ul>
  );
}
```

---

## What NOT to Do

```ts
// ❌ Do NOT use a client component for data fetching
'use client';
import { useAuth } from '@clerk/nextjs';

export default function Dashboard() {
  const { userId } = useAuth();
  // fetching data here is wrong
}

// ❌ Do NOT invent columns that don't exist in the schema
const result = await db.select({ clicks: links.clicks }).from(links); // 'clicks' does not exist

// ❌ Do NOT define custom interfaces — use inferred types
interface MyLink { id: number; url: string; clicks: number; } // wrong

// ❌ Do NOT use relative imports
import { db } from '../../db'; // wrong — use @/db

// ❌ Do NOT swallow errors silently
try {
  return await db.select().from(links).where(eq(links.userId, userId));
} catch {
  return []; // wrong — throw the error instead
}
```

---

## Schema Reference

The `links` table (from `db/schema.ts`):

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` | Primary key, auto-generated |
| `userId` | `text` | Clerk user ID of the owner |
| `url` | `text` | The original destination URL |
| `slug` | `text` | Unique short code |
| `createdAt` | `timestamp with time zone` | Set on insert |
| `updatedAt` | `timestamp with time zone` | Updated on every row update |

Exported types:

```ts
import { type Link, type NewLink } from '@/db/schema';
```

See [docs/database.md](docs/database.md) for full schema details and query examples.
