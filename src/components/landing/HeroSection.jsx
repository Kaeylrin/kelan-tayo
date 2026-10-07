import { Link } from 'react-router-dom';
import { scrollToTarget } from '../../utils/smoothScroll.js';

/** HeroSection — above-the-fold landing hero. */
export function HeroSection() {
  return (
    <section className="hero hero-animate">
      <span className="eyebrow">para hindi na tayo mag drawing</span>
      <h1 className="display">Find the day everyone's actually free.</h1>
      <p>
        Stop guessing across endless group chat messages. Mark when you have
        classes, shifts, or plans, Kelan Tayo finds the dates where nobody is
        busy.
      </p>
      <div className="hero-ctas">
        <Link to="/create" className="btn-primary">
          Create a plan
        </Link>
        <a
          href="#how-it-works"
          className="btn-secondary"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById('how-it-works');
            if (target) scrollToTarget(target, { offset: -96 });
          }}
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
