'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative overflow-hidden bg-black px-6 py-32 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.696 0.17 162.48 / 15%) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your finances won't
            <br />
            fix themselves.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/50">
            Every day without clarity is another day of guessing. Start for free
            today — it takes less time than your next coffee run.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[oklch(0.696_0.17_162.48)] px-8 py-3.5 text-sm font-semibold text-black shadow-lg shadow-[oklch(0.696_0.17_162.48/25%)] transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-[oklch(0.696_0.17_162.48/35%)]"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/30">
            Free forever · No credit card · Takes 2 minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
