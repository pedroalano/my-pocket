'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#showcase' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Sign in', href: '/login' },
  { label: 'Register', href: '/register' },
];

export function FooterSection() {
  return (
    <footer className="border-t border-white/5 bg-[oklch(0.06_0_0)] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.696_0.17_162.48)] transition-transform duration-200 group-hover:scale-110">
              <Wallet className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm font-semibold text-white">My Pocket</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-white/40 transition-colors duration-200 hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} My Pocket. Free forever.
          </p>
        </div>
      </div>
    </footer>
  );
}
