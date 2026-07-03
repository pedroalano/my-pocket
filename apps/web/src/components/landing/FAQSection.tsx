'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'Is My Pocket really free?',
    a: 'Yes. My Pocket is completely free with no hidden fees, no premium tier, and no trial period. Every feature is available to every user, forever.',
  },
  {
    q: 'Does it connect to my bank?',
    a: "No — and that's intentional. You enter transactions manually. This keeps your banking credentials completely out of the picture and makes you more aware of each purchase as you log it.",
  },
  {
    q: 'How is my data protected?',
    a: 'Your data is stored securely, scoped strictly to your account, and never sold or shared. We don\'t run ads. Your financial data is yours.',
  },
  {
    q: 'How long does it take to set up?',
    a: "Most users have their accounts, categories, and first transactions set up in under 10 minutes. You'll see a meaningful dashboard on your first session.",
  },
  {
    q: 'Can I track recurring bills and subscriptions?',
    a: 'Yes. My Pocket has a dedicated recurring transactions feature. Log your rent, Netflix, gym membership — they\'ll be tracked automatically on their schedule.',
  },
  {
    q: 'What if I have multiple bank accounts or credit cards?',
    a: 'My Pocket supports unlimited accounts — checking, savings, credit cards, cash, and investment accounts. Every transaction is linked to an account and your balances update in real time.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-900 group-hover:text-[oklch(0.45_0.15_162.48)] transition-colors duration-200">
          {q}
        </span>
        <span className="mt-0.5 shrink-0 text-gray-400 transition-colors duration-200 group-hover:text-[oklch(0.696_0.17_162.48)]">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-gray-500">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="faq" ref={ref} className="bg-white px-6 py-28">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[oklch(0.696_0.17_162.48/10%)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[oklch(0.45_0.15_162.48)]">
            FAQ
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
            Common questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-gray-100 bg-white px-6 shadow-sm"
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.q} {...faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
