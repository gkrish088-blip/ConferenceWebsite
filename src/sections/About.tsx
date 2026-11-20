import { PhotoGallery } from "../components/PhotoGallery";
import { about, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import { InstitutionMark } from "../components/InstitutionMark";
import styles from "../styles/site.module.css";

export function AboutSection() {
  const title =
    about.title ?? site.nav.find((item) => item.id === "about")?.label ?? "";

  return (
    <Section
      id="about"
      title={title}
      renderIntro={(heading) => (
        <PhotoGallery>
          {heading}
          <RichText text={about.description} />
        </PhotoGallery>
      )}
    >
      <div className={styles.institutionGrid}>
        {about.institutions.map((institution) => (
          <article
            className={styles.institutionBlock}
            key={institution.id}
            data-institution-card
          >
            <div className={styles.instituteMarks}>
              <InstitutionMark institution={institution} showName={false} />
              {institution.secondaryLogo && (
                <img
                  className={styles.departmentLogo}
                  src={institution.secondaryLogo.src}
                  alt={institution.secondaryLogo.alt}
                  loading="lazy"
                />
              )}
            </div>
            <h3>{institution.name}</h3>
            <p>{institution.description}</p>
            <ContentLink
              link={{
                label: institution.linkLabel,
                url: institution.url,
                placeholder: institution.placeholder,
              }}
              className={styles.contentLink}
            />
          </article>
        ))}
      </div>
    </Section>
  );
}
