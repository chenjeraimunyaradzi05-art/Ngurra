import { NextResponse } from 'next/server';

function decodeJwtPayload(token) {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

/**
 * Auth disabled: proxy passes through without auth redirects.
 */
export function proxy(req) {
    const { pathname } = req.nextUrl;
    
    // AI hub routes - ensure proper pathing
    if (pathname.startsWith('/ai/') || pathname === '/ai') {
        // AI routes are public but may have user context
        return NextResponse.next();
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/member/:path*', 
        '/mentor/:path*', 
        '/tafe/:path*', 
        '/company/:path*', 
        '/admin/:path*',
        '/ai/:path*',
    ],
};
