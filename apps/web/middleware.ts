import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import rateLimit from '@/config/rateLimit';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const secret = process.env.NEXTAUTH_SECRET;

  if (pathname.startsWith('/public/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    try {
      // @ts-ignore - req.ip might not be standard, handle potential undefined
      const identifier = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const result = await rateLimit.limit(identifier);

      if (!result.success) {
        console.warn(`Rate limit exceeded for ${identifier} on ${pathname}`);
        return new NextResponse(null, {
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            'Content-Type': 'text/plain',
            'Retry-After': String(Math.ceil(result.reset / 1000 - Date.now() / 1000)),
          },
        });
      }
      return NextResponse.next();
    } catch (error) {
       console.error("Rate limiting error:", error);
       return new NextResponse(null, { status: 500, statusText: 'Internal Server Error' });
    }
  }

  if (pathname.startsWith('/docs')) {
    return NextResponse.next();
  }

  if (!secret) {
      console.error("NEXTAUTH_SECRET is not set. Authentication checks disabled.");
      return NextResponse.next();
  }

  const token = await getToken({ req, secret });
  const isAuthenticated = !!token;

  const publicOnlyPaths = ['/', '/login', '/signup'];
  const isAccessingPublicOnlyPath = publicOnlyPaths.includes(pathname);

  if (isAuthenticated) {
    if (isAccessingPublicOnlyPath) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/_next')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

  } else {
    if (!isAccessingPublicOnlyPath && !pathname.startsWith('/_next')) { 
       return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|sw.js|site.webmanifest).*)',
  ],
};