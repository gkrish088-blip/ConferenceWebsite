import { site, speakers } from "../content";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

function Portrait({
  image,
  focusFallback,
}: {
  image: { src: string; alt: string; focus: string } | undefined;
  focusFallback: string;
}) {
  const source = image ?? speakers.placeholderPhoto;
  return (
    <img
      className={styles.personPortrait}
      data-person-portrait
      src={source.src}
      alt={source.alt}
      style={{ objectPosition: image?.focus ?? focusFallback }}
    />
  );
}

export function SpeakersSection() {
  const title = site.nav.find((item) => item.id === "speakers")?.label ?? "";
  return (
    <Section id="speakers" title={title} alternate>
      <h3 className={styles.subsectionHeading}>{speakers.guestHeading}</h3>
      <div className={styles.guestsGrid}>
        {speakers.guestsOfHonor.map((guest) => (
          <article
            className={styles.featuredSpeaker}
            key={guest.id}
            data-featured-speaker
          >
            <div className={styles.featuredSpeakerCopy}>
              <h3>{guest.name}</h3>
              <p>{guest.role}</p>
              <p>{guest.affiliation}</p>
              <RichText text={guest.bio} />
            </div>
            <Portrait image={guest.photo} focusFallback="center" />
          </article>
        ))}
      </div>
      <h3 className={styles.subsectionHeading}>{speakers.delegatesHeading}</h3>
      {speakers.delegates.length > 0 ? (
        <div className={styles.delegateGrid} data-delegate-grid>
          {speakers.delegates.map((delegate) => (
            <article
              className={styles.delegateCard}
              key={delegate.id}
              data-delegate-card
            >
              <Portrait image={delegate.photo} focusFallback="center" />
              <h3>{delegate.name}</h3>
              <p>{delegate.affiliation}</p>
            </article>
          ))}
        </div>
      ) : (
        <p>{speakers.emptyDelegatesText}</p>
      )}
    </Section>
  );
}
