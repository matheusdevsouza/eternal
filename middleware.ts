import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security Headers Middleware
 * 
 * Implements comprehensive security headers including:
 * - Content-Security-Policy (CSP) with strict directives
 * - Permissions-Policy with minimal permissions
 * - HSTS, X-Frame-Options, etc.
 */

// CSP Directives - Strict but functional for Next.js
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Next.js requires 'unsafe-inline' for its hydration and HMR scripts
    // This is a known limitation - mitigated by other strict policies
    "'unsafe-inline'",
    "'unsafe-eval'" // Required for Next.js in development, consider removing in production
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'" // Required for React/Next.js inline styles and Framer Motion
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:' // User-submitted images must be HTTPS
  ],
  'font-src': ["'self'"], // next/font self-hosts Google Fonts
  'media-src': [
    "'self'",
    'blob:',
    'https:' // User-submitted audio must be HTTPS
  ],
  'connect-src': [
    "'self'",
    'ws:', // WebSocket for Next.js HMR in development
    'wss:'
  ],
  'frame-src': ["'none'"], // No iframes needed
  'object-src': ["'none'"], // Block Flash/plugins
  'base-uri': ["'self'"], // Prevent base tag injection
  'form-action': ["'self'"], // Forms only submit to same origin
  'frame-ancestors': ["'none'"], // Prevent clickjacking (embedding)
  'upgrade-insecure-requests': [] // Auto-upgrade HTTP to HTTPS
};

// Build CSP header string
function buildCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) return directive;
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

// Permissions-Policy - Only well-supported features
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=(self)', // Needed for audio player
  'camera=()',
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)', // Needed for photo gallery
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'picture-in-picture=(self)', // Future video feature
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'usb=()',
  'web-share=(self)', // Share gift links
  'xr-spatial-tracking=()'
].join(', ');

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // =====================================================
  // SECURITY HEADERS
  // =====================================================
  
  // Content-Security-Policy - Prevent XSS, data exfiltration, etc.
  response.headers.set('Content-Security-Policy', buildCSP());
  
  // Permissions-Policy - Disable unused browser features
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking (legacy, CSP frame-ancestors is primary)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // XSS Protection (legacy, CSP is primary)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS - Force HTTPS (production only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // =====================================================
  // AUTHENTICATION CHECK
  // =====================================================
  
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/configuracoes')) && !request.cookies.get('session')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};


