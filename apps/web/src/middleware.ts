import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match the root and all locale-prefixed paths
  // Exclude Next.js internals and static files
  matcher: [
    '/',
    '/(ht|fr|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
};
