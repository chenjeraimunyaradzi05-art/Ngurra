'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SubscriptionBadge from './SubscriptionBadge';
import BrandLogo from './BrandLogo';
import { useTheme } from './ThemeProvider';

// eslint-disable-next-line no-unused-vars
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
});

const publicNavigation = [
  { name: 'Pathways', href: '/#pathways' },
  { name: 'Tinashe AI', href: '/#suite' },
  { name: 'Connect', href: '/community' },
  { name: 'Business', href: '/business-suite' },
  { name: 'Partners', href: '/#partners' },
  { name: 'Pitch Deck', href: '/#deck' },
];

function roleNavigation(userType: string) {
  const t = String(userType || '').toLowerCase();
  if (t === 'member')
    return [
      { name: 'Dashboard', href: '/member/dashboard' },
      { name: 'My Mentors', href: '/member/mentorship' },
      { name: 'Applications', href: '/member/applications' },
      { name: 'Social', href: '/social-feed' },
      { name: 'Business', href: '/business-suite' },
      { name: 'Career', href: '/career' },
      { name: 'Messages', href: '/member/messages' },
      { name: 'Settings', href: '/settings' },
    ];
  if (t === 'mentor')
    return [
      { name: 'Mentor Hub', href: '/mentor/dashboard' },
      { name: 'Sessions', href: '/mentor/sessions' },
      { name: 'Messages', href: '/member/messages' },
      { name: 'Settings', href: '/settings' },
    ];
  if (t === 'tafe' || t === 'institution')
    return [
      { name: 'TAFE', href: '/tafe/dashboard' },
      { name: 'Courses', href: '/tafe/courses' },
      { name: 'Students', href: '/tafe/students' },
      { name: 'Settings', href: '/settings' },
    ];
  if (t === 'company')
    return [
      { name: 'Dashboard', href: '/company/dashboard' },
      { name: 'Jobs', href: '/company/jobs' },
      { name: 'Candidates', href: '/company/candidates' },
      { name: 'Billing', href: '/company/billing' },
      { name: 'Settings', href: '/settings' },
    ];
  if (t === 'admin')
    return [
      { name: 'Dashboard', href: '/admin' },
      { name: 'Users', href: '/admin/users' },
      { name: 'Settings', href: '/settings' },
    ];
  return [];
}

function ThemeIcon({ theme, mounted }: { theme: string; mounted: boolean }) {
  if (!mounted) {
    return <Sun className="h-5 w-5 opacity-50" />;
  }

  if (theme === 'dark') {
    return <Moon className="h-5 w-5" />;
  }
  if (theme === 'cosmic') {
    return <Sparkles className="h-5 w-5 text-amber-500" />;
  }
  return <Sun className="h-5 w-5" />;
}

export default function HeaderNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { resolvedTheme, setTheme, mounted } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const cycleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const navItems = isAuthenticated && user ? roleNavigation(user.userType) : publicNavigation;

  const isActiveLink = (href: string) => {
    const normalizedHref = href.split('#')[0] || '/';
    if (href.startsWith('/#')) {
      return pathname === '/';
    }
    if (normalizedHref === '/') {
      return pathname === '/';
    }
    return pathname === normalizedHref || pathname?.startsWith(`${normalizedHref}/`);
  };

  return (
    <header
      className="bg-white/95 dark:bg-slate-950/95 cosmic:bg-cosmic-dark border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm dark:shadow-slate-950/50 backdrop-blur-md transition-colors duration-200"
      role="banner"
    >
      <nav
        id="navigation"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 py-4 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="sr-only">Tinashe</span>
              <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-xl border border-pink-500/30 shadow-md shadow-pink-900/20">
                <BrandLogo
                  alt="Tinashe logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </span>
              <span className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Tinashe
                </span>
                <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 xl:block">
                  Your next step, connected.
                </span>
              </span>
            </Link>
            <div className="hidden ml-8 space-x-6 lg:block">
              {navItems.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={isActiveLink(link.href) ? 'page' : undefined}
                  className={`rounded-sm text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                    isActiveLink(link.href)
                      ? 'text-pink-700 dark:text-pink-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4 hidden lg:flex lg:items-center">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-colors duration-150"
              aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : resolvedTheme === 'dark' ? 'cosmic' : 'light'} mode`}
              title={`Current: ${resolvedTheme || 'system'} mode`}
            >
              <ThemeIcon theme={resolvedTheme} mounted={mounted} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  {user && (
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {user.profile?.firstName || 'Member'}
                    </span>
                  )}
                </div>
                <SubscriptionBadge />
                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/signin"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-500/20 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all hover:-translate-y-px"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
          <div className="lg:hidden">
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-colors duration-150"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div id="mobile-menu" className="py-3 flex flex-col gap-3 lg:hidden" role="menu">
            {navItems.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActiveLink(link.href) ? 'page' : undefined}
                className={`rounded-sm px-2 py-1 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActiveLink(link.href)
                    ? 'text-pink-700 dark:text-pink-300'
                    : 'text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-4 w-full text-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-teal-800"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 w-full text-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-base font-medium text-white hover:bg-teal-800"
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
