import { getLinkBySlug, incrementLinkClicks } from '@/data/links';
import { NextRequest, NextResponse } from 'next/server';

const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return new NextResponse(notFoundHtml('Invalid link'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let link;
  try {
    link = await getLinkBySlug(slug);
  } catch (error) {
    console.error('[redirect] database error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  if (!link) {
    return new NextResponse(notFoundHtml('Link not found'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    await incrementLinkClicks(link.id);
  } catch (error) {
    console.error('[redirect] failed to increment click count:', error);
    // Non-fatal — still redirect the user
  }

  const status = link.isPermanent ? 301 : 302;
  return NextResponse.redirect(link.url, { status });
}

function notFoundHtml(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${message}</title>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        background: #f9fafb;
        color: #111827;
        gap: 1.5rem;
      }
      h1 { font-size: 3rem; font-weight: 800; text-align: center; }
      a {
        font-size: 1.125rem;
        color: #6366f1;
        text-decoration: none;
        font-weight: 500;
      }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <h1>${message}</h1>
    <a href="/">Back to homepage</a>
  </body>
</html>`;
}
