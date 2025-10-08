import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import type { NextMiddleware, NextRequest } from 'next/server';
import { env } from './env';

// Import clerkMiddleware directly from @clerk/nextjs/server for Clerk detection
import { clerkMiddleware } from '@clerk/nextjs/server';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  return securityHeaders();
}) as unknown as NextMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // Also skip portal routes
    '/((?!_next|portal|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};