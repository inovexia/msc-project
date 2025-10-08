// Edge runtime compatible auth exports (no server-only functions)
// Only export functions that work in edge runtime

export { 
  clerkMiddleware,
  createClerkClient 
} from '@clerk/nextjs/server';