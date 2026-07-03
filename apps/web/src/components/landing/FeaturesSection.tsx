'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  BarChart3,
  RefreshCw,
  Wallet,
  Bell,
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard at a glance',
    description:
      'See your complete financial picture the moment you log in — income, expenses, and balances unified in one view.',
  },
  {
    icon: Target,
    title: 'Smart budgets',
    description:
      'Set spending limits per category. My Pocket warns you before you overspend, not after.',
  },
  {
    icon: BarChart3,
    title: 'Visual insights',
    description:
      'Charts that reveal where your money actually goes — no spreadsheet skills required.',
  },
  {
    icon: RefreshCw,
    title: 'Recurring transactions',
    description:
      'Log subscriptions and bills once. My Pocket tracks them automatically so nothing slips through.',
  },
  {
    icon: Wallet,
    title: 'Multiple accounts',
    description:
      'Checking, savings, credit cards, cash — all in one place with real-time balance calculations.',
  },
  {
    icon: Bell,
    title: 'Category tracking',
    description:
      'Create custom categories that match your life. Understand exactly where every dollar lands.',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" ref={ref} className="bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.15_162.48)]">
            Everything you need
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Built for people, not accountants
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            No jargon. No complexity. Just the tools that actually help you stop
            leaking money and start building a cushion.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 80% at 50% 120%, oklch(0.696 0.17 162.48 / 5%) 0%, transparent 70%)',
                }}
              />
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[oklch(0.696_0.17_162.48/10%)] transition-colors duration-200 group-hover:bg-[oklch(0.696_0.17_162.48/18%)]">
                <feature.icon className="h-5 w-5 text-[oklch(0.45_0.15_162.48)]" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
