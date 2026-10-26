import React from "react";
import { about, site } from "../content/landing";
import { Countdown } from "../components/Countdown";
import styles from "../styles/landing.module.css";

const contours = [
  "M-120 180 C60 110 165 95 275 125 S465 210 600 165 790 65 930 86 1110 160 1290 110",
  "M-120 220 C60 150 165 135 275 165 S465 250 600 205 790 105 930 126 1110 200 1290 150",
  "M-120 260 C60 190 165 175 275 205 S465 290 600 245 790 145 930 166 1110 240 1290 190",
  "M-120 300 C60 230 165 215 275 245 S465 330 600 285 790 185 930 206 1110 280 1290 230",
  "M-120 85 C60 155 165 170 275 140 S465 55 600 100 790 200 930 180 1110 105 1290 155",
];

export function LandingApp({ fullMode }: { fullMode: boolean }) {
  React.useEffect(() => {
    document.title = site.name;
  }, []);

  return (
    <main className={styles.landingScreen}>
      <svg
        className={styles.landingContours}
        viewBox="0 0 1180 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {contours.map((path, index) => (
          <path
            className={styles.landingContourPath}
            d={path}
            pathLength={1}
            data-landing-contour
            key={index}
            style={{ animationDelay: `${0.38 + index * 0.09}s` }}
          />
        ))}
      </svg>
      <div className={styles.landingContent} data-landing-content>
        <header className={styles.landingHeader}>
          <h1>{site.name}</h1>
          <p className={styles.landingTagline}>{site.tagline}</p>
        </header>
        <Countdown />
        {fullMode && (
          <a className={styles.enterButton} href="/">
            {site.landing.enterLabel}
          </a>
        )}
        <div className={styles.landingDetails}>
          <p>{site.datesText}</p>
          <p>{site.venue}</p>
          {!fullMode && (
            <p className={styles.comingSoon}>{site.landing.comingSoon}</p>
          )}
        </div>
        <div className={styles.landingMarks}>
          {about.institutions.map((institution) => (
            <div className={styles.landingMark} key={institution.id}>
              <img src={institution.logo.src} alt={institution.logo.alt} />
              <span>{institution.name}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
