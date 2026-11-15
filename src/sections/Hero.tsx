import { HeroSlideshow } from "../components/HeroSlideshow";
import { registration, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="conference-title">
      <HeroSlideshow />
      <div className={`${styles.container} ${styles.heroInner}`}>
        <h1 id="conference-title" className={styles.heroTitle}>
          {site.name}
        </h1>
        <p className={styles.heroDates}>{site.datesText}</p>
        <p className={styles.heroVenue}>{site.venue}</p>
        <RichText text={site.tagline} className={styles.heroDescription} />
        <ContentLink
          link={registration.links[0]}
          className={styles.primaryButton}
        />
      </div>
    </section>
  );
}
