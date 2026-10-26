import React from "react";
import { site } from "../content/landing";
import { getCountdown } from "../lib/countdown";
import styles from "../styles/landing.module.css";

export function Countdown() {
  const [now, setNow] = React.useState(Date.now);
  const [announcement, setAnnouncement] = React.useState("");
  const lastAnnouncedMinute = React.useRef(-1);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const countdown = getCountdown(site.eventStart, now, site.eventEnd);
  const units = site.landing.countdownUnits;

  React.useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      const updated = Date.now();
      setNow(updated);
      const minute = Math.floor(updated / 60_000);
      if (minute !== lastAnnouncedMinute.current) {
        lastAnnouncedMinute.current = minute;
        setAnnouncement(
          `${getCountdown(site.eventStart, updated, site.eventEnd).days} ${units.days}`,
        );
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, units.days]);

  if (countdown.state === "live")
    return <p className={styles.countdownState}>{site.landing.liveText}</p>;
  if (countdown.state === "ended")
    return <p className={styles.countdownState}>{site.landing.endedText}</p>;

  const values = [
    { value: countdown.days, label: units.days },
    { value: countdown.hours, label: units.hours },
    { value: countdown.minutes, label: units.minutes },
    { value: countdown.seconds, label: units.seconds },
  ];

  return (
    <div className={styles.countdownBlock}>
      <p className="sr-only">{site.accessibility.countdownLabel}</p>
      <div className={styles.countdownGrid} data-countdown-grid>
        {values.map((part, index) => (
          <div className={styles.countdownUnit} key={part.label}>
            <span
              data-countdown-value
              className={
                index === 0 ? styles.countdownDays : styles.countdownShortValue
              }
            >
              {index === 0
                ? String(part.value)
                : String(part.value).padStart(2, "0")}
            </span>
            <span>{part.label}</span>
          </div>
        ))}
      </div>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
