/**
 * Omnify — 구축 어드민 접근 제한 (Vercel Edge Middleware)
 * ADMIN_USER / ADMIN_PASSWORD 환경변수가 설정된 경우에만 통과.
 */
export const config = {
  matcher: ['/admin.html', '/js/admin-app.js'],
};

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Omnify Internal Admin", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function locked() {
  return new Response(
    'Admin is locked. Set ADMIN_USER and ADMIN_PASSWORD in the Vercel project environment.',
    {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  );
}

export default function middleware(request) {
  const user = process.env.ADMIN_USER || '';
  const pass = process.env.ADMIN_PASSWORD || '';

  if (!user || !pass) {
    return locked();
  }

  const header = request.headers.get('authorization') || '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) {
        return fetch(request);
      }
    } catch (e) {
      /* fall through */
    }
  }

  return unauthorized();
}
