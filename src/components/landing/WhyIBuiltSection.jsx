import React from 'react';

export function WhyIBuiltSection() {
  return (
    <section className="story-section">
      <div className="section-heading">
        <div className="section-eyebrow">Behind the app</div>
        <h2 className="display">Why I built this</h2>
      </div>

      <div className="story-layout">
        <div className="story-card">
          <svg
            className="story-quote-mark"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M7.17 6.17C4.87 8.47 3.5 11.1 3.5 14.13c0 3.1 2.02 5.37 4.63 5.37 2.2 0 3.87-1.73 3.87-3.87 0-2.03-1.4-3.6-3.3-3.6-.3 0-.57.03-.8.1.27-1.8 1.63-3.53 3.4-4.83L9 5.5c-.63.2-1.23.43-1.83.67zm10 0C14.87 8.47 13.5 11.1 13.5 14.13c0 3.1 2.02 5.37 4.63 5.37 2.2 0 3.87-1.73 3.87-3.87 0-2.03-1.4-3.6-3.3-3.6-.3 0-.57.03-.8.1.27-1.8 1.63-3.53 3.4-4.83L19 5.5c-.63.2-1.23.43-1.83.67z"/>
          </svg>
          <p>
            Since first year, ang dami naming sinasabing "kelan tayo lalabas,"
            "gala tayo." Every group chat had the same pattern.
          </p>
          <p>
            Someone will propose a date, three people are free, two aren't, someone says
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
