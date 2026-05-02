# Data Mutation

## Overview

This document covers conventions for performing data mutations — create, update, and delete operations — in this application.

Read this file before implementing any server action, form submission handler, or any logic that writes to the database.

---

## Rules

### Server Actions Only

- **ALL data mutations must be implemented as Next.js Server Actions.** Never perform mutations directly in client components or route handlers.
- Server action files must be named `actions.ts` and must include `'use server'` as the **first line** of the file. This directive tells Next.js to treat the file as server-only, enabling secure access to secrets and database operations.
- Server action files must be **colocated** in the same directory as the component that invokes them.

```
app/
  dashboard/
    page.tsx        # Server component (dashboard page)
    actions.ts      # Server actions used by dashboard components
```

### Calling Server Actions

- Server actions must only be called from **client components**.
- Client components that call server actions must include `'use client'` as the **first line** of the file.

### TypeScript

- All data passed into a server action must have explicit TypeScript types.
- **NEVER use the `FormData` TypeScript type.**
- **NEVER use `any`.**

### Validation with Zod

- All incoming data must be validated using **Zod** inside the server action **before** any database operations are performed.
- If validation fails, return `{ error: string }` immediately with a descriptive message.

```ts
import { z } from 'zod';

const schema = z.object({
  url: z.string().url('Invalid URL'),
  slug: z.string().min(1, 'Slug is required'),
});

const result = schema.safeParse(input);
if (!result.success) {
  return { error: result.error.errors[0].message };
}
```

### Authentication Check

- Every server action must check for an authenticated user **as its first step**, before validation and before any database operations.
- Use `const { userId } = await auth()` imported from `@clerk/nextjs/server`.
- If `userId` is `null`, return `{ error: 'Unauthorized' }` immediately.

```ts
import { auth } from '@clerk/nextjs/server';

export async function createLink(input: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  // validation and db operations follow...
}
```

> **Note:** `@clerk/nextjs/server` is the correct and recommended import path for Clerk v4+ with Next.js 13/14/16. If Clerk changes this import path in a future release, update both the code and this document to use the new path.

### Delegating Database Operations

- Database operations must **NOT** be performed directly inside server actions using raw Drizzle queries.
- All database interactions must be delegated to helper functions located in the `/data` directory.
- Server actions import and call these helpers — they must not call `db` directly or contain raw Drizzle queries themselves.

```ts
// ✅ Correct — delegate to /data helper
import { createLink as createLinkInDb } from '@/data/links';
await createLinkInDb({ userId, url, slug });

// ❌ Wrong — raw Drizzle query inside server action
await db.insert(links).values({ userId, url, slug });
```

### Error Handling — Never Throw

- Server actions must **NEVER throw errors**.
- All outcomes (success and failure) must be communicated by returning a typed result object.
  - Failure: `{ error: string }`
  - Success: `{ success: true }`

### Revalidation

- After a successful mutation, call `revalidatePath` imported from `next/navigation` with the relevant path (e.g., `revalidatePath('/dashboard')`) so the UI reflects the updated data.
- `revalidatePath` must be called **before** returning `{ success: true }`.

```ts
import { revalidatePath } from 'next/navigation';

revalidatePath('/dashboard');
return { success: true };
```

### Imports

- All imports must use the `@/` path alias. **Never use relative paths.**

```ts
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/navigation';
import { createLink } from '@/data/links';
```

---

## Execution Order Inside a Server Action

Every server action must follow this exact order:

1. **Auth check** — verify `userId` with `auth()`, return `{ error: 'Unauthorized' }` if null
2. **Validation** — validate input with Zod, return `{ error: string }` if invalid
3. **Database operation** — call the appropriate `/data` helper
4. **Revalidation** — call `revalidatePath` with the relevant path
5. **Return success** — return `{ success: true }`

---

## Full Example

**`app/dashboard/actions.ts`**

```ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/navigation';
import { createLink } from '@/data/links';

const createLinkSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  slug: z.string().min(1, 'Slug cannot be empty'),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLinkAction(input: CreateLinkInput) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  // 2. Validation
  const result = createLinkSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // 3. Database operation (delegated to /data helper)
  await createLink({ userId, ...result.data });

  // 4. Revalidation
  revalidatePath('/dashboard');

  // 5. Return success
  return { success: true };
}
```

**`app/dashboard/CreateLinkForm.tsx`** — client component invoking the action

```tsx
'use client';

import { createLinkAction } from '@/app/dashboard/actions';

export function CreateLinkForm() {
  async function handleSubmit(url: string, slug: string) {
    const result = await createLinkAction({ url, slug });
    if (result.error) {
      console.error(result.error);
    }
  }

  // ...form JSX
}
```
