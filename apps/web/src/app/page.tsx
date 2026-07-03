'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FreeSection } from '@/components/landing/FreeSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return null;

  return (
    <main className="min-h-screen">
      <LandingNav />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <ProductShowcaseSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FreeSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
