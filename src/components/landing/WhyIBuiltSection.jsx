import React from 'react';

/**
 * WhyIBuiltSection — personal story card with gold left-border accent,
 * decorative oversized quotation mark, sign-off, and sticky stat card.
 */
export function WhyIBuiltSection() {
  return (
    <section className="story-section">
      <div className="section-heading">
        <div className="section-eyebrow">Behind the app</div>
        <h2 className="display">Why I built this</h2>
      </div>

      <div className="story-layout">
        {/* ── Story card ── */}
        <div className="story-card">
          {/* Large decorative quote mark (opacity 0.22) */}
          <svg
            className="story-quote-mark"
            viewBox="0 0 64 64"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M0 40.5V64h23.5V40.5H7.833C7.833 29.833 14.167 20.5 26.833 12.833L20.5 0C7.167 7.667 0 22.167 0 40.5ZM37.5 40.5V64H61V40.5H45.333C45.333 29.833 51.667 20.5 64.333 12.833L58 0C44.667 7.667 37.5 22.167 37.5 40.5Z" />
          </svg>

          <p>
            Since first year, ang dami naming sinasabing "kelan tayo lalabas,"
            "gala tayo." Every group chat had the same pattern. Someone will
            propose a date, three people are free, two aren't, someone says
            "next time nalang," and next time never comes.
          </p>
          <p>
            Looking back, dalawang beses lang talaga kami naka gala sa buong
            panahong 'yon and I am a 4th yr student na. Yun lang. Lahat ng iba
            pang plano, hangout, kahit simpleng kainan, naging usapan lang,
            hindi natuloy.
          </p>
          <p>
            Bukod sa pera, hindi naman kasi kami tinatamad magkita, iba-iba
            lang talaga schedule namin, may pasok, may trabaho, may shift. Kaya
            naisip ko, bakit hindi na lang i-automate yung pag figure out kung
            kelan lahat kami free, instead na patuloy na mag plan sa group chat
            eh hindi naman natutuloy.
          </p>
          <p>
            Kaya ginawa ko 'to. Hindi pa perfect, personal project lang siya na
            ginawa out of boredom, pero sana magamit niyo rin kasama ng sarili
            niyong barkada, at sana mas madalas kayong makagala kesa sa amin.
          </p>

          <div className="story-signoff">
            <img
              src="/new_pfp.jpg"
              alt="Wrenier"
              className="story-avatar"
              width={38}
              height={38}
            />
            <div className="story-signoff-text">
              Wrenier
              <span>creator of Kelan Tayo</span>
            </div>
          </div>
        </div>

        {/* ── Sticky gold stat card ── */}
        <div className="story-stat">
          <div className="story-stat-number display">2</div>
          <div className="story-stat-label">
            actual hangouts out of years of planning
          </div>
          <div className="story-stat-sub">That's why this app exists.</div>
        </div>
      </div>
    </section>
  );
}
