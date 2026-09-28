import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if we're accessing a root-level dynamic route with a UUID format
  const uuidPattern = /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\/.*)?$/;
  const match = pathname.match(uuidPattern);
  
  if (match) {
    const id = match[1];
    
    // Handle program routes specifically - don't rewrite these
    const programRoutes = ['/resources'];
    const isProgramRoute = programRoutes.some(route => pathname.includes(`/${id}${route}`));
    
    if (isProgramRoute) {
      // Let the request continue to the program routes
      return NextResponse.next();
    }
    
    // For all other UUID paths that don't match program routes, treat as cohort route
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
      // Rewrite to the cohort route
      const url = new URL(`/cohort/${id}${request.nextUrl.search}`, request.url);
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
} 