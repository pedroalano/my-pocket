'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Eye, Zap, Lock } from 'lucide-react';

const benefits = [
  {
    icon: Eye,
    title: 'See the truth about your money',
    body: 'Most people are shocked to see where they actually spend. My Pocket shows you the honest picture — no judgment, just data.',
    highlight: 'Awareness is the first step.',
  },
  {
    icon: Zap,
    title: 'Build habits that stick',
    body: 'Budgets you set today inform decisions you make tomorrow. Small, consistent awareness compounds into financial stability.',
    highlight: 'Progress beats perfection.',
  },
  {
    icon: Lock,
    title: 'Your data stays yours',
    body: "We don't sell your data, connect to your bank, or run ads. My Pocket is a tool you control — completely private by design.",
    highlight: 'No open banking required.',
  },
];

export function BenefitsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-gray-50 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.15_162.48)]">
            Why My Pocket
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple tools, real results
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full"
                style={{
                  background: 'oklch(0.696 0.17 162.48 / 6%)',
                  filter: 'blur(24px)',
                }}
              />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.696_0.17_162.48/10%)]">
                <b.icon className="h-6 w-6 text-[oklch(0.45_0.15_162.48)]" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{b.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-500">{b.body}</p>
              <span className="inline-block rounded-lg bg-[oklch(0.696_0.17_162.48/10%)] px-3 py-1 text-xs font-medium text-[oklch(0.45_0.15_162.48)]">
                {b.highlight}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
