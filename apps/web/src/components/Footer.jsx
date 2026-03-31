"use client";

import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Mail,
  Shield,
  Info,
  FileText,
  BookOpen,
  Accessibility,
} from 'lucide-react';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
});

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative py-10 bg-slate-950 text-slate-100 border-t border-slate-800 transition-colors duration-200 ${spaceGrotesk.className}`}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 via-slate-900 to-sky-500 text-lg font-bold text-white shadow-lg">
                N
              </div>
              <div>
                <div className="text-lg font-bold text-white">Nexta</div>
                <div className="text-xs text-slate-400">Your next step, connected.</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Nexta is the calm, capable guide for real progress: jobs, learning, mentors,
              community, business tools, financial wellbeing, and long-term momentum.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-3 text-white">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#pathways" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <ArrowRight className="w-3 h-3" /> Explore Pathways
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Briefcase className="w-3 h-3" /> Find Opportunities
                </Link>
              </li>
              <li>
                <Link href="/#suite" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Bot className="w-3 h-3" /> Nexta AI
                </Link>
              </li>
              <li>
                <Link href="/community" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" /> Nexta Connect
                </Link>
              </li>
              <li>
                <Link href="/business-suite" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Building2 className="w-3 h-3" /> Nexta Business
                </Link>
              </li>
              <li>
                <Link href="/company/setup" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Building2 className="w-3 h-3" /> For Employers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-3 text-white">Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#deck" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" /> Pitch Deck
                </Link>
              </li>
              <li>
                <Link href="/#voice" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Info className="w-3 h-3" /> Brand Voice
                </Link>
              </li>
              <li>
                <Link href="/#storefront" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" /> App Store Copy
                </Link>
              </li>
              <li>
                <Link href="/resources" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <BookOpen className="w-3 h-3" /> Resource Library
                </Link>
              </li>
              <li>
                <Link href="/government" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Building2 className="w-3 h-3" /> Run Programs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-1.5 rounded-sm text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-3 h-3" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-3 text-white">About</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  <Info className="w-3 h-3" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  <Shield className="w-3 h-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  <FileText className="w-3 h-3" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  <Accessibility className="w-3 h-3" /> Accessibility
                </Link>
              </li>
              <li>
                <Link href="/signin" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
                  <ArrowRight className="w-3 h-3" /> Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] border-t border-slate-800">
          <p className="text-center sm:text-left text-slate-400">
            Free to join. Your data stays yours. You control what you share.
          </p>
          <p className="whitespace-nowrap text-slate-400">
            © {currentYear} Nexta · Built by <span className="text-white">Munyaradzi Chenjerai</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
