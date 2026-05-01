# Agent Instructions

This is a **link shortener** web application. It lets authenticated users create short URLs that redirect to long destination URLs.

## Coding Standards

Detailed standards are documented in the `/docs` directory. **Before writing or modifying any code, you MUST read every relevant file in `/docs` using the `read_file` tool. Do not rely on memory or assumptions — always retrieve and reference the current file contents.**

| Area | File | Read before… |
|---|---|---|
| Authentication | [docs/auth.md](docs/auth.md) | Any auth flow, sign-in/sign-up UI, route protection, or Clerk usage |
| UI Components | [docs/ui.md](docs/ui.md) | Any component, styling, layout, or icon change |

> **Rule:** If your change touches an area listed above, open and read the corresponding doc file first. Failure to do so may produce code that violates project conventions.



## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via [Neon](https://neon.tech) serverless driver |
| ORM | Drizzle ORM |
| Auth | Clerk |
| UI Components | shadcn/ui (radix-nova style) |
| UI Primitives | Radix UI |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Package Manager | npm |

## This is NOT the Next.js you know

Next.js 16 has breaking changes — APIs, conventions, and file structure differ significantly from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code. Heed deprecation notices.

Relevant guides:
- `01-app/01-getting-started/05-server-and-client-components.md`
- `01-app/01-getting-started/06-fetching-data.md`
- `01-app/01-getting-started/07-mutating-data.md`
- `01-app/01-getting-started/15-route-handlers.md`
- `01-app/01-getting-started/08-caching.md`

## Project Structure

```
app/            # Next.js App Router — pages, layouts, route handlers, server actions
  layout.tsx    # Root layout with ClerkProvider and header
  page.tsx      # Home page
components/     # Shared React components
  ui/           # shadcn/ui-generated primitives (do not edit manually)
db/
  index.tsx     # Drizzle client (exports `db`)
  schema.ts     # Drizzle table definitions
lib/
  utils.ts      # Utility helpers (cn, etc.)
docs/           # Coding standards and conventions (read before making changes)
drizzle.config.ts
next.config.ts
proxy.ts        # Next.js request proxy (Clerk middleware lives here — see docs/auth.md)
```

## Key Conventions

### Path Aliases

Use `@/` for all internal imports — it maps to the project root.

```ts
import { db } from '@/db'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

### TypeScript

- Strict mode is enabled. Never use `any`.
- All `.ts` / `.tsx` files. No plain `.js` files.

### File Naming

- Pages and layouts: lowercase with hyphens for directories (`app/dashboard/page.tsx`).
- Components: PascalCase for the component name and file (`components/LinkCard.tsx`).
- Server-only modules (actions, db queries): camelCase (`lib/actions.ts`, `lib/queries.ts`).

