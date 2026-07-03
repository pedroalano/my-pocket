'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const included = [
  'Unlimited transactions',
  'Unlimited accounts',
  'All budget categories',
  'Recurring transaction tracker',
  'Visual charts & insights',
  'Dashboard overview',
  'Income & expense tracking',
  'No ads. Ever.',
];

export function FreeSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[oklch(0.06_0_0)] px-6 py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, oklch(0.696 0.17 162.48 / 10%) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-4 inline-block rounded-full border border-[oklch(0.696_0.17_162.48/30%)] bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.696_0.17_162.48)]">
            Pricing
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Completely free.
            <br />
            No catch.
          </h2>
          <p className="mt-4 text-lg text-white/50">
            My Pocket is free because financial clarity shouldn't cost extra. Everything
            is included — no tiers, no upsells, no expiration.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, oklch(0.696 0.17 162.48 / 60%), transparent)',
            }}
          />
          <div className="mb-6 flex flex-col items-center">
            <span className="text-6xl font-bold text-white">$0</span>
            <span className="mt-1 text-sm text-white/40">forever</span>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 text-left">
            {included.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[oklch(0.696_0.17_162.48)]" />
                <span className="text-sm text-white/70">{item}</span>
              </motion.div>
            ))}
          </div>

          <a
            href="/register"
            className="block w-full rounded-xl bg-[oklch(0.696_0.17_162.48)] py-3 text-center text-sm font-semibold text-black shadow-lg shadow-[oklch(0.696_0.17_162.48/25%)] transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-[oklch(0.696_0.17_162.48/35%)]"
          >
            Create your free account
          </a>
          <p className="mt-3 text-xs text-white/30">
            No credit card. No trial period. No expiration.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
