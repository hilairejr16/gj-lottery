import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Use these instead of next/link and next/navigation in client/server components
// so locale is automatically prefixed to all internal hrefs.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
