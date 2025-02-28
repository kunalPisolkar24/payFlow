import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import rateLimit from '@/config/rateLimit';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/public/')) { 
    return NextResponse.next();
  }
  // @ts-ignore
  const identifier = req.ip ?? '127.0.0.1'; 
  const isAllowed = await rateLimit.limit(identifier);

  if (!isAllowed.success) {
    // Return a 429 status code (Too Many Requests)
    return new NextResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};