# UI Components

## Overview

All UI components in this project must be built using **shadcn/ui** and **Tailwind CSS v4**. No other component libraries or custom-built components are permitted.

## Rules

- **shadcn/ui is the only component library.** Do not install or use third-party component libraries such as MUI, Chakra UI, Ant Design, Mantine, etc.
- **Do not hand-craft primitive components.** If shadcn/ui provides a component (e.g. `Button`, `Dialog`, `Input`, `Select`), use it — do not rebuild it from scratch.
- **All styling must use Tailwind CSS utility classes.** Do not write custom CSS files, inline `style` props, or use CSS-in-JS solutions (e.g. styled-components, Emotion).
- **Generated shadcn/ui primitives live in `components/ui/`.** Do not edit files in that directory manually — they are managed by the shadcn CLI.
- **Shared, composed components live in `components/`.** These wrap or extend shadcn/ui primitives and are named in PascalCase (e.g. `components/LinkCard.tsx`).
- **Icons must use Lucide React.** Do not import icons from other icon libraries.

---

## Adding a New shadcn/ui Component

Use the shadcn CLI to add components. This keeps `components/ui/` consistent and avoids manual errors.

```bash
npx shadcn@latest add <component-name>
```

Example — adding a `Card` component:

```bash
npx shadcn@latest add card
```

This generates `components/ui/card.tsx`, which you can then import anywhere in the project:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```

---

## Styling with Tailwind CSS

Apply styles exclusively through Tailwind utility classes on JSX elements. Use the `cn()` helper from `@/lib/utils` when conditionally merging class names.

```tsx
import { cn } from '@/lib/utils'

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
```

---

## Composing shadcn/ui Primitives

When building feature-specific components, compose shadcn/ui primitives rather than reimplementing their functionality.

**Correct — composing primitives:**

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CreateLinkForm() {
  return (
    <form className="flex gap-2">
      <Input placeholder="https://example.com/long-url" className="flex-1" />
      <Button type="submit">Shorten</Button>
    </form>
  )
}
```

**Incorrect — rebuilding primitives manually:**

```tsx
// Do not do this
export function CreateLinkForm() {
  return (
    <form className="flex gap-2">
      <input className="border rounded px-3 py-2 ..." placeholder="..." />
      <button className="bg-blue-500 text-white px-4 py-2 rounded ...">Shorten</button>
    </form>
  )
}
```

---

## shadcn/ui Style

This project uses the **radix-nova** style. When running `npx shadcn@latest add`, the CLI will use the style configured in `components.json` automatically — no extra flags needed.
