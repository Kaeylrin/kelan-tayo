import { Reveal } from '../shared/Reveal.jsx';

/**
 * HowItWorksSection — three alternating image/text steps.
 * Section id="how-it-works" so the hero anchor link scrolls here.
 *
 */
export function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how-it-works">
      <Reveal className="section-heading">
        <div className="section-eyebrow">See how it works</div>
        <h2 className="display">Three steps. That's it.</h2>
      </Reveal>

      {/* Step 1 — Create */}
      <Reveal className="step">
        <div className="step-text">
          <div className="step-number">1</div>
          <h3 className="display">Create</h3>
          <p>
            Set your plan, pick your dates, get a link. Name your gala, choose
            Next 7 days, Next 2 weeks, or a custom range, then share the link or
            room code straight to your group chat. No sign up needed.
          </p>
        </div>
        <div className="step-image">
          <img
            src="/screenshots/kelan-tayo-create.webp"
            width={1280}
            height={765}
            decoding="async"
            alt="Create a plan screen"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* Step 2 — Mark schedule */}
      <Reveal className="step">
        <div className="step-text">
          <div className="step-number">2</div>
          <h3 className="display">Mark schedule</h3>
          <p>
            Everyone marks when they're busy. That's it. Drag across the hours
            you're occupied, classes, shifts, whatever. Unmarked time stays
            free. Takes less than a minute per person.
          </p>
        </div>
        <div className="step-image">
          <img
            src="/screenshots/kelan-tayo-mark-schedule.webp"
            width={1280}
            height={765}
            decoding="async"
            alt="Mark your schedule screen"
            loading="lazy"
          />
        </div>
      </Reveal>

      {/* Step 3 — Dashboard */}
      <Reveal className="step">
        <div className="step-text">
          <div className="step-number">3</div>
          <h3 className="display">Dashboard</h3>
          <p>
            Kelan Tayo does the math for you. See the best matching date
            highlighted, plus backup options ranked by how many people are free.
            The room creator picks one and locks it in.
          </p>
        </div>
        <div className="step-image">
          <img
            src="/screenshots/kelan-tayo-dashboard.webp"
            width={1280}
            height={765}
            decoding="async"
            alt="Dashboard screen showing best dates"
            loading="lazy"
          />
        </div>
      </Reveal>
    </section>
  );
}
