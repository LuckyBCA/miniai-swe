import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/api(.*)',
  '/trpc(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // Only protect routes in production or when proper keys are configured
  if (isProtectedRoute(req) && process.env.NODE_ENV === 'production') {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)(/|)", "/(api|trpc)(.*)"],
};
