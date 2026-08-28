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
    const tags = [
      '<script src="/enhance.js" defer></script>',
      '<script src="/usernames.js" defer></script>',
      '<script src="/music.js" defer></script>',
      '<script src="/crowd-01.js" defer></script>',
      '<script src="/crowd-02.js" defer></script>',
      '<script src="/crowd-03.js" defer></script>',
      '<script src="/crowd-04.js" defer></script>',
      '<script src="/crowd-05.js" defer></script>',
      '<script src="/crowd-assets.js" defer></script>',
    ].filter((tag) => !html.includes(tag.match(/src="([^"]+)/)?.[1] || ''));

    if (tags.length) {
      const injected = tags.join('');
      html = html.includes('</body>')
        ? html.replace('</body>', `${injected}</body>`)
        : `${html}${injected}`;
    }

    const headers = new Headers();
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store, max-age=0');
    return new Response(html, { status: 200, headers });
  } catch {
    return NextResponse.next();
  }
}
