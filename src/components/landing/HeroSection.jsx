import React from 'react';
import { Link } from 'react-router-dom';

/**
 * HeroSection — above-the-fold landing hero.
 * Props:
 *   onCreatePlan  function  optional callback when primary CTA is clicked
 */
export function HeroSection({ onCreatePlan }) {
  return (
    <section className="hero">
      <span className="eyebrow">para hindi na tayo mag drawing</span>
      <h1 className="display">Find the day everyone's actually free.</h1>
      <p>
        Stop guessing across endless group chat messages. Mark when you have
        classes, shifts, or plans, Kelan Tayo finds the dates where nobody is
        busy.
      </p>
      <div className="hero-ctas">
        <Link to="/create" className="btn-primary" onClick={onCreatePlan}>
          Create a plan
        </Link>
        <a href="#how-it-works" className="btn-secondary">
          See how it works
        </a>
      </div>
    </section>
  );
}
