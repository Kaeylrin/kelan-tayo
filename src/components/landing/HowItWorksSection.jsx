import React from 'react';

/**
 * HowItWorksSection — three alternating image/text steps.
 * Section id="how-it-works" so the hero anchor link scrolls here.
 *
 * Layout:
 *   Step 1  — text left,  image right  (odd)
 *   Step 2  — image left, text right   (even — CSS handles reorder via nth-child)
 *   Step 3  — text left,  image right  (odd)
 */
export function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-heading">
        <div className="section-eyebrow">See how it works</div>
        <h2 className="display">Three steps. That's it.</h2>
      </div>

      {/* Step 1 — Create */}
      <div className="step">
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
            src="/screenshots/kelan-tayo-create.png"
            alt="Create a plan screen"
            loading="lazy"
          />
        </div>
      </div>

      {/* Step 2 — Mark schedule */}
      <div className="step">
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
            src="/screenshots/kelan-tayo-mark-schedule.png"
            alt="Mark your schedule screen"
            loading="lazy"
          />
        </div>
      </div>

      {/* Step 3 — Dashboard */}
      <div className="step">
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
            src="/screenshots/kelan-tayo-dashboard.png"
            alt="Dashboard screen showing best dates"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
