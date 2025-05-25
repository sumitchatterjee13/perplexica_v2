import { NextResponse, type NextRequest } from 'next/server';

// Routes essential for the setup process (accessible when no admin exists)
const setupRoutes = [
  '/setup',
  '/api/setup/create-admin',
  '/api/system', // Path for the internal admin check API
];

// Publicly accessible routes AFTER an admin user has been set up
const publicPostSetupRoutes = [
  '/login',
  '/api/auth/login',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the current request is FOR our internal API route, let it pass through.
  // This prevents the middleware from trying to process its own internal fetch calls.
  if (pathname === '/api/system') {
    return NextResponse.next();
  }

  let adminExists: boolean | null = null;
  try {
    // Determine the base URL for the internal API fetch call
    let currentInternalApiBase: string;
    if (process.env.NODE_ENV === 'production') {
        // In production, always use localhost and PORT (or default 3000)
        currentInternalApiBase = `http://localhost:${process.env.PORT || 3000}`;
    } else {
        // In development, use localhost and the port from the incoming request or PORT or default 3000
        currentInternalApiBase = `http://localhost:${request.nextUrl.port || process.env.PORT || 3000}`;
    }

    const checkAdminUrl = new URL('/api/system', currentInternalApiBase);
    console.log(`Middleware: Attempting to fetch admin status from: ${checkAdminUrl.toString()}`); // Log the URL

    const response = await fetch(checkAdminUrl.toString(), {
      headers: {},
    });

    if (!response.ok) {
      console.error(`Middleware: Error fetching admin status from API. Status: ${response.status}`);
      const errorBody = await response.text();
      console.error(`Middleware: API response body: ${errorBody}`);
      return NextResponse.json(
        { error: 'Service temporarily unavailable due to internal check failure.' },
        { status: 503 }
      );
    }

    const data = await response.json();
    if (typeof data.adminExists !== 'boolean') {
        console.error('Middleware: Invalid response format from /api/system. Expected boolean adminExists.');
        return NextResponse.json({ error: 'Middleware configuration error: Invalid admin status response.' }, { status: 500 });
    }
    adminExists = data.adminExists;

  } catch (error) {
    console.error("Middleware: Network or other error fetching admin status:", error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  if (adminExists === null) {
    console.error("Middleware: Admin existence check resulted in null state after API call.");
    return NextResponse.json({ error: 'Middleware configuration error.' }, { status: 500 });
  }

  if (!adminExists) {
    if (setupRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/setup';
    url.search = '';
    url.protocol = request.nextUrl.protocol; // Ensure consistent protocol for redirect
    url.host = request.nextUrl.host;         // Ensure consistent host for redirect
    return NextResponse.redirect(url);
  } else {
    // If admin exists, and user tries to access a setup route (EXCEPT our internal API check)
    if (setupRoutes.some(route => pathname.startsWith(route) && pathname !== '/api/system')) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      url.protocol = request.nextUrl.protocol;
      url.host = request.nextUrl.host;
      return NextResponse.redirect(url);
    }

    if (publicPostSetupRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('perplexica_session');
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      if (!pathname.startsWith('/login') && !pathname.startsWith('/api/auth/')) {
          url.search = `?redirect=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      }
      url.protocol = request.nextUrl.protocol;
      url.host = request.nextUrl.host;
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
