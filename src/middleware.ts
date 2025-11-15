import { type NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/songs",
  "/search",
  "/upload",
  "/settings",
];

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const _isPublicRoute = publicRoutes.includes(pathname);

  // For static exports, this middleware won't run, but we include it for future use
  // Client-side protection is handled in the components

  // If it's a protected route, we'd check for auth token here
  // For now, we'll let client-side handle the redirect
  if (isProtectedRoute) {
    // In a non-static export setup, we would check for session here
    // const session = request.cookies.get('sb-access-token');
    // if (!session) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
