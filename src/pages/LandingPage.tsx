
import React from 'react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
