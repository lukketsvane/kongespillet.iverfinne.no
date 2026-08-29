import { NextResponse } from 'next/server';

const ORIGIN = 'https://finn-harald.iver-raknes-finne.chatgpt.site/';
const RENDER_MARKER = 'i-n>50&&(n=i,_())';
const RENDER_PATCH = 'i-n>100&&(n=i,_())';
const CROWD_MARKER = 'Math.round(n*5),3,145);return{targetSize';
// Hard mode: a dense crowd from the first years, and a much higher ceiling later.
const CROWD_PATCH = 'Math.round(n*7),18,190);return{targetSize';
const BUILD = '20260829-menu7';

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
      cache: 'no-store',
    });

    if (!upstream.ok) return NextResponse.next();

    const source = await upstream.text();
    let patched = source;
    if (patched.includes(RENDER_MARKER)) patched = patched.replace(RENDER_MARKER, RENDER_PATCH);
    if (patched.includes(CROWD_MARKER)) patched = patched.replace(CROWD_MARKER, CROWD_PATCH);

    const headers = new Headers();
    headers.set('content-type', 'text/javascript; charset=utf-8');
    headers.set('cache-control', 'public, max-age=60, stale-while-revalidate=300');
    headers.set('x-fh-render-patch', patched.includes(RENDER_PATCH) ? '1' : '0');
    headers.set('x-fh-crowd-cap', patched.includes(CROWD_PATCH) ? '190' : '0');
    headers.set('x-fh-build', BUILD);
    return new Response(patched, { status: 200, headers });
  } catch {
    return NextResponse.next();
  }
}

function bustGameBundle(html) {
  return html.replace(/src=(['"])(\/assets\/page-[^'"?]+\.js)(?:\?[^'"]*)?\1/g, (_m, q, src) =>
    `src=${q}${src}?fh=${BUILD}${q}`
  );
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

    let html = bustGameBundle(await upstream.text());
    const tags = [
      `<script src="/crowd-01.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-02.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-03.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-04.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-05.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-assets.js?v=${BUILD}" defer></script>`,
      `<script src="/era-crowd.js?v=${BUILD}" defer></script>`,
      `<script src="/crowd-fix.js?v=${BUILD}" defer></script>`,
      `<script src="/enhance.js?v=${BUILD}" defer></script>`,
      `<script src="/menu.js?v=${BUILD}" defer></script>`,
      `<script src="/usernames.js?v=${BUILD}" defer></script>`,
      `<script src="/music.js?v=${BUILD}" defer></script>`,
    ];

    const injected = tags.join('');
    html = html.includes('</body>')
      ? html.replace('</body>', `${injected}</body>`)
      : `${html}${injected}`;

    const headers = new Headers();
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store, max-age=0');
    headers.set('x-fh-build', BUILD);
    return new Response(html, { status: 200, headers });
  } catch {
    return NextResponse.next();
  }
}
