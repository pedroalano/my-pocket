'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    initials: 'MR',
    name: 'Marcus R.',
    role: 'Freelance designer',
    quote:
      "I was making good money but always broke by the 25th. Three weeks with My Pocket and I found $640/month I was wasting on subscriptions I'd forgotten about. Mind-blowing.",
    stars: 5,
    color: 'oklch(0.696 0.17 162.48)',
  },
  {
    initials: 'SC',
    name: 'Sofia C.',
    role: 'Nurse, 2 kids',
    quote:
      "Budgeting apps always felt like homework. This one is different — I log a transaction in 10 seconds and the dashboard just... makes sense. First time I've kept a budget for more than a month.",
    stars: 5,
    color: 'oklch(0.6 0.18 250)',
  },
  {
    initials: 'JT',
    name: 'James T.',
    role: 'Recent graduate',
    quote:
      "Started with $4,200 in credit card debt. Used the budget feature to find money every month. Paid it all off in 8 months. I genuinely didn't think that was possible for me.",
    stars: 5,
    color: 'oklch(0.7 0.16 50)',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5 fill-[oklch(0.696_0.17_162.48)] text-[oklch(0.696_0.17_162.48)]"
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" ref={ref} className="bg-white px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.15_162.48)]">
            Real people, real results
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            They got their money back.
            <br />
            You can too.
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${t.color.replace(')', ' / 5%)')} 0%, transparent 70%)`,
                }}
              />
              <Stars count={t.stars} />
              <blockquote className="mt-4 text-sm leading-7 text-gray-600">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
