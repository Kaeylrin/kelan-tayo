import React, { useState } from 'react';

// Landing section components
import { HeroSection }        from '../components/landing/HeroSection.jsx';
import { StatsSection }       from '../components/landing/StatsSection.jsx';
import { HowItWorksSection }  from '../components/landing/HowItWorksSection.jsx';
import { WhyIBuiltSection }   from '../components/landing/WhyIBuiltSection.jsx';

// Shared shell components
import { Navbar }             from '../components/shared/Navbar.jsx';
import { Footer }             from '../components/shared/Footer.jsx';

/**
 * MarketingLandingPage — the public-facing / route.
 *
 * Renders:
 *   Navbar (isLandingPage pill scroll behaviour)
 *   HeroSection
 *   StatsSection
 *   HowItWorksSection
 *   WhyIBuiltSection
 *   Footer + LegalModal
 */
export function MarketingLandingPage() {

  return (
    <div className="landing-page">
      {/* Fixed nav that becomes a floating pill on scroll */}
      <Navbar isLandingPage={true} />
      

      {/* Content container — matches reference HTML <main> */}
      <main className="landing-main">
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <WhyIBuiltSection />
      </main>

      {/* Footer with legal modal trigger */}
      <Footer />
    </div>
  );
}


