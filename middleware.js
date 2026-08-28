import { NextResponse } from 'next/server';

const ORIGIN = 'https://finn-harald.iver-raknes-finne.chatgpt.site/';

export const config = {
  matcher: ['/'],
};

export async function middleware(request) {
  if (request.method !== 'GET') return NextResponse.next();

  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html')) return NextResponse.next();

  try {
    const upstream = await fetch(ORIGIN, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) return NextResponse.next();

    let html = await upstream.text();
    const tag = '<script src="/enhance.js" defer></script>';
    if (!html.includes('/enhance.js')) {
      html = html.includes('</body>')
        ? html.replace('</body>', `${tag}</body>`)
        : `${html}${tag}`;
    }

    const headers = new Headers();
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store, max-age=0');
    return new Response(html, { status: 200, headers });
  } catch {
    return NextResponse.next();
  }
}
