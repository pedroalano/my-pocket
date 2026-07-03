'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

function MockDashboard() {
  const bars = [65, 40, 80, 55, 90, 70, 45];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0_0)] shadow-2xl shadow-black/60">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <div className="mx-auto h-5 w-40 rounded-md bg-white/5 text-center text-[10px] leading-5 text-white/20">
          mypocket.app/dashboard
        </div>
      </div>

      <div className="p-5">
        {/* Top stat cards */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            {
              label: 'Balance',
              value: '$3,842',
              delta: '+$420',
              up: true,
              icon: DollarSign,
            },
            {
              label: 'Income',
              value: '$5,200',
              delta: 'This month',
              up: true,
              icon: TrendingUp,
            },
            {
              label: 'Expenses',
              value: '$1,358',
              delta: '-12% vs last',
              up: false,
              icon: TrendingDown,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] text-white/40">{card.label}</span>
                <card.icon className="h-3 w-3 text-white/20" />
              </div>
              <div className="text-base font-bold text-white">{card.value}</div>
              <div
                className={`mt-0.5 text-[10px] ${card.up ? 'text-[oklch(0.696_0.17_162.48)]' : 'text-red-400/70'}`}
              >
                {card.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">
              Monthly spending
            </span>
            <span className="rounded-md bg-[oklch(0.696_0.17_162.48/15%)] px-2 py-0.5 text-[10px] text-[oklch(0.696_0.17_162.48)]">
              2024
            </span>
          </div>
          <div className="flex h-24 items-end gap-2">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.06, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom', height: `${h}%` }}
                className="flex-1 rounded-t-md"
              >
                <div
                  className="h-full w-full rounded-t-md"
                  style={{
                    background:
                      i === 4
                        ? 'oklch(0.696 0.17 162.48)'
                        : 'oklch(0.696 0.17 162.48 / 30%)',
                  }}
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {months.map((m) => (
              <div key={m} className="flex-1 text-center text-[9px] text-white/20">
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="mt-3 rounded-xl border border-white/5 bg-white/5 p-4">
          <span className="mb-3 block text-xs font-medium text-white/60">
            Recent transactions
          </span>
          <div className="space-y-2">
            {[
              { name: 'Grocery store', cat: 'Food', amount: '-$84.20', neg: true },
              { name: 'Salary', cat: 'Income', amount: '+$3,200', neg: false },
              { name: 'Netflix', cat: 'Subscriptions', amount: '-$15.99', neg: true },
            ].map((tx) => (
              <div key={tx.name} className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-white/80">
                    {tx.name}
                  </div>
                  <div className="text-[9px] text-white/30">{tx.cat}</div>
                </div>
                <span
                  className={`text-[11px] font-semibold ${tx.neg ? 'text-red-400/80' : 'text-[oklch(0.696_0.17_162.48)]'}`}
                >
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductShowcaseSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="showcase"
      ref={ref}
      className="relative overflow-hidden bg-[oklch(0.06_0_0)] px-6 py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, oklch(0.696 0.17 162.48 / 8%) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-4 inline-block rounded-full bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.696_0.17_162.48)]">
              How it works
            </span>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Clarity in
              <br />
              under 5 minutes.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/50">
              Add your accounts, log a few transactions, set a budget — and for the
              first time, you'll see exactly where your money is going. Most users
              find their first "leak" within the first session.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                'Create an account — no payment info needed',
                'Add your bank accounts and credit cards',
                'Log income and expenses in seconds',
                'Watch your dashboard paint the real picture',
              ].map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.696_0.17_162.48)] text-[10px] font-bold text-black">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-6 text-white/60">{step}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32, y: 16 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-3xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, oklch(0.696 0.17 162.48 / 12%) 0%, transparent 70%)',
              }}
            />
            <MockDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
