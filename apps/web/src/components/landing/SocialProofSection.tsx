'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Star, Users, TrendingDown } from 'lucide-react';

const proofItems = [
  { icon: Users, value: '10,000+', label: 'Active users' },
  { icon: Star, value: '4.9 / 5', label: 'Average rating' },
  { icon: TrendingDown, value: '68%', label: 'Cut overspending in month 1' },
  { icon: Shield, value: '100%', label: 'Private & secure' },
];

export function SocialProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="border-y border-white/5 bg-[oklch(0.08_0_0)] px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-white/30"
        >
          Trusted by people reclaiming their finances
        </motion.p>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {proofItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.696_0.17_162.48/10%)]">
                <item.icon className="h-5 w-5 text-[oklch(0.696_0.17_162.48)]" />
              </div>
              <span className="text-2xl font-bold text-white">{item.value}</span>
              <span className="text-xs text-white/40">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
