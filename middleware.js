import { NextResponse } from 'next/server';

const ORIGIN = 'https://finn-harald.iver-raknes-finne.chatgpt.site/';
const RENDER_MARKER = 'i-n>50&&(n=i,_())';
const RENDER_PATCH = 'i-n>100&&(n=i,_())';
const CROWD_MARKER = 'Math.round(n*5),3,145);return{targetSize';
const CROWD_PATCH = 'Math.round(n*5),3,96);return{targetSize';

export const config = {
  matcher: ['/', '/assets/page-:path*'],
};

async function patchGameBundle(request) {
  try {
    const upstream = await fetch(new URL(request.nextUrl.pathname, ORIGIN), {
      headers: {
        accept: 'text/javascript,application/javascript,*/*;q=0.1',
        'user-agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      },
      cache: 'force-cache',
    });

    if (!upstream.ok) return NextResponse.next();

    const source = await upstream.text();
    let patched = source;
    if (patched.includes(RENDER_MARKER)) patched = patched.replace(RENDER_MARKER, RENDER_PATCH);
    if (patched.includes(CROWD_MARKER)) patched = patched.replace(CROWD_MARKER, CROWD_PATCH);

    const headers = new Headers();
    headers.set('content-type', 'text/javascript; charset=utf-8');
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    headers.set('x-fh-render-patch', patched.includes(RENDER_PATCH) ? '1' : '0');
    headers.set('x-fh-crowd-cap', patched.includes(CROWD_PATCH) ? '96' : '0');
    return new Response(patched, { status: 200, headers });
  } catch {
    return NextResponse.next();
  }
}

export async function middleware(request) {
  if (request.method !== 'GET') return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/assets/page-') && pathname.endsWith('.js')) {
    return patchGameBundle(request);
  }

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
      '<script src="/crowd-01.js" defer></script>',
      '<script src="/crowd-02.js" defer></script>',
      '<script src="/crowd-03.js" defer></script>',
      '<script src="/crowd-04.js" defer></script>',
      '<script src="/crowd-05.js" defer></script>',
      '<script src="/crowd-assets.js" defer></script>',
      '<script src="/enhance.js" defer></script>',
      '<script src="/usernames.js" defer></script>',
      '<script src="/music.js" defer></script>',
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
