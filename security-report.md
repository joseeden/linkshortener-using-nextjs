# Security Audit Report — Link Shortener

**Date:** May 3, 2026
**Reviewer:** GitHub Copilot (Claude Sonnet 4.6)

---

## Summary

This report covers a security audit of the `linkshortener` Next.js 16 application. The scope includes all non-ignored source files: server actions, route handlers, database access layer, middleware/proxy, React components, and configuration files. Environment files (`.env`, `.env.local`) are excluded per `.gitignore` and must be reviewed manually.

The application uses Clerk for authentication, Drizzle ORM with Neon PostgreSQL for data storage, and Next.js server actions for mutations. All CRUD operations require an authenticated `userId` from Clerk, and database queries scope records by `userId`, preventing cross-user data access.

---

## Findings

| ID | Description | Location | Severity | Recommendation |
|----|-------------|----------|----------|----------------|
| 1 | **No URL scheme validation — Stored XSS via `javascript:` URI** | [app/dashboard/actions.ts#L9](app/dashboard/actions.ts#L9), [app/dashboard/actions.ts#L46](app/dashboard/actions.ts#L46) | High | Restrict accepted URL schemes to `http:` and `https:` in both `createLinkSchema` and `updateLinkSchema`. See details below. |
| 2 | **Open redirect to non-HTTP schemes** | [app/api/redirect/\[slug\]/route.ts#L41](app/api/redirect/%5Bslug%5D/route.ts#L41) | Medium | Validate that `link.url` begins with `https://` or `http://` before calling `NextResponse.redirect()`. |
| 3 | **Weak slug entropy — non-cryptographic random** | [app/dashboard/actions.ts#L28](app/dashboard/actions.ts#L28) | Low | Replace `Math.random()` with `crypto.randomBytes(4).toString('hex')` or `crypto.randomUUID().slice(0, 8)`. |
| 4 | **Missing HTTP security response headers** | [next.config.ts](next.config.ts) | Low | Add `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers via the `headers()` function in `next.config.ts`. |

---

## Detailed Findings

### Finding 1 — Stored XSS via `javascript:` URI (High)

**Location:** [app/dashboard/actions.ts#L9](app/dashboard/actions.ts#L9), [app/dashboard/actions.ts#L46](app/dashboard/actions.ts#L46), [app/dashboard/page.tsx#L36](app/dashboard/page.tsx#L36)

Both `createLinkSchema` and `updateLinkSchema` validate the `url` field using `z.string().url()`. Zod's `.url()` uses the WHATWG URL parser which accepts `javascript:` URIs (e.g., `javascript:alert(document.cookie)`) as structurally valid URLs.

In the dashboard, `link.url` is rendered directly as an anchor `href`:

```tsx
<a href={link.url} target="_blank" rel="noopener noreferrer">
```

Clicking a link whose stored URL is `javascript:...` executes the script in the current browsing context, bypassing `target="_blank"` and `rel="noopener noreferrer"` (those attributes apply to the opened tab, not the source page). This is a stored XSS vector.

While only the authenticated link owner views their own links, this still represents a vulnerability because:
- It violates the principle of input validation at system boundaries.
- It could be leveraged in social engineering scenarios (e.g., convincing a user to click their own link in a shared session).
- Any future feature exposing links to other users would immediately be exploitable.

**Recommendation:** Add a URL scheme allowlist in both schemas:

```ts
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
```

---

### Finding 2 — Open Redirect to Non-HTTP Schemes (Medium)

**Location:** [app/api/redirect/\[slug\]/route.ts#L41](app/api/redirect/%5Bslug%5D/route.ts#L41)

The redirect route handler issues an HTTP redirect to the raw `link.url` value retrieved from the database, without any protocol check:

```ts
const status = link.isPermanent ? 301 : 302;
return NextResponse.redirect(link.url, { status });
```

If a non-HTTP URL is stored (e.g., `javascript:`, `file:`, `data:`, `ftp:`), the server emits a `Location:` header with that scheme. While modern browsers do not execute `javascript:` URIs from HTTP redirect responses, the server still issues a redirect to an unintended scheme. The `data:` scheme in particular has historically been abused in older browsers.

This finding is directly connected to Finding 1. Fixing the URL scheme validation in Finding 1 removes the primary path for storing a non-HTTP URL. However, defense-in-depth warrants an independent check at the point of use.

**Recommendation:** Add a scheme guard before redirecting:

```ts
const redirectUrl = new URL(link.url);
if (redirectUrl.protocol !== 'https:' && redirectUrl.protocol !== 'http:') {
  return new NextResponse('Invalid redirect target', { status: 400 });
}
return NextResponse.redirect(link.url, { status });
```

---

### Finding 3 — Weak Slug Entropy (Low)

**Location:** [app/dashboard/actions.ts#L28](app/dashboard/actions.ts#L28)

When no custom slug is provided, a random slug is generated using:

```ts
const slug = result.data.slug ?? Math.random().toString(36).slice(2, 8);
```

`Math.random()` is a pseudo-random number generator (PRNG) seeded by the JavaScript runtime. It is not cryptographically secure and its output may be predictable under certain conditions (e.g., knowing the seed or observing other outputs). A 6-character base-36 slug generated this way provides approximately 30 bits of entropy, which is sufficient for casual use but not robust against targeted enumeration of short links.

**Recommendation:** Use the Node.js `crypto` module for slug generation:

```ts
import { randomBytes } from 'crypto';

const slug = result.data.slug ?? randomBytes(4).toString('hex'); // 8 hex chars, 32 bits of CSPRNG entropy
```

Or using `crypto.randomUUID()` sliced:

```ts
const slug = result.data.slug ?? crypto.randomUUID().replace(/-/g, '').slice(0, 8);
```

---

### Finding 4 — Missing HTTP Security Headers (Low)

**Location:** [next.config.ts](next.config.ts)

The `next.config.ts` file defines URL rewrites but does not configure any HTTP security response headers. Without these headers, the application is missing defence-in-depth controls that browsers enforce:

- **Content-Security-Policy (CSP):** Limits which resources can be loaded, reducing XSS impact.
- **X-Frame-Options** or `frame-ancestors` CSP directive: Prevents clickjacking.
- **X-Content-Type-Options: nosniff:** Prevents MIME-type sniffing.
- **Referrer-Policy:** Controls how much referrer information is sent to third-party domains.

**Recommendation:** Add a `headers()` function to `next.config.ts`:

```ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
        },
      ],
    },
  ];
},
```

> **Note:** The CSP above is a starting-point template. Adjust `script-src` and other directives to precisely match the sources used by Clerk, Google Fonts, and other third-party integrations before deploying to production.

---

## Items Confirmed Secure

The following areas were reviewed and found to be secure based on the current code:

| Area | Notes |
|------|-------|
| **Authentication** | All server actions verify `userId` via `await auth()` from Clerk before performing any DB write. Unauthenticated calls return `{ error: 'Unauthorized' }`. |
| **Authorization (ownership enforcement)** | All `updateLink` and `deleteLink` DB queries include `eq(links.userId, userId)`, ensuring a user can only modify their own records. |
| **SQL Injection** | All database access uses Drizzle ORM's parameterized query builder. No raw SQL string interpolation is present outside of the safe `sql` tagged template literal used for atomic click increment. |
| **CSRF** | Next.js 16 server actions include built-in CSRF protection (origin header verification). No custom CSRF handling is required. |
| **Slug injection** | The slug is validated with a strict `^[a-zA-Z0-9_-]+$` regex in both the server action and the redirect route handler, preventing slug-based injection attacks. |
| **Secrets management** | All secrets (`DATABASE_URL`, Clerk keys) are loaded from environment variables. No hardcoded credentials were found in any non-ignored file. `.env*` files are correctly listed in `.gitignore`. |
| **notFoundHtml template** | The `notFoundHtml` function interpolates a `message` parameter into HTML, but is only ever called with hardcoded string literals (`'Invalid link'`, `'Link not found'`). No user input reaches this template. |
| **Dependency secrets** | No hardcoded API keys or secrets were found in `package.json` or configuration files. |

---

## Conclusion

The codebase demonstrates sound security practices in the areas of authentication, authorization, and database access. The most significant finding is the absence of a URL scheme allowlist, which permits `javascript:` URIs to be stored and rendered as anchor `href` values (Stored XSS, Finding 1). This should be remediated as a priority by adding an `http:`/`https:`-only constraint to both URL validation schemas.

The remaining findings are low-to-medium severity and relate to weak random slug generation and missing HTTP security headers — both of which are straightforward to address.

After remediating Findings 1 and 2, the overall security posture of this codebase is **good**. The foundational controls (authentication, authorization, parameterized queries, secrets management) are correctly implemented.
