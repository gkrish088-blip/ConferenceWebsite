import { hospitality, site } from "../content";
import { HospitalityImages } from "../components/HospitalityImages";
import { RichText } from "../components/RichText";
import { Section } from "../components/Section";
import styles from "../styles/site.module.css";

export function HospitalitySection() {
  const title = site.nav.find((item) => item.id === "hospitality")?.label ?? "";
  return (
    <Section id="hospitality" title={title}>
      <RichText text={hospitality.intro} className={styles.hospitalityIntro} />
      <div className={styles.hospitalityTopics}>
        {hospitality.items.map((item) => (
          <section
            key={item.id}
            id={`hospitality-${item.id}`}
            className={styles.hospitalityTopic}
            aria-labelledby={`hospitality-${item.id}-heading`}
          >
            <h3
              id={`hospitality-${item.id}-heading`}
              className={styles.hospitalityTopicHeading}
            >
              {item.title}
            </h3>
            <div className={styles.hospitalityContent}>
              <RichText text={item.body} />
              <HospitalityImages images={item.images} />
            </div>
          </section>
        ))}
      </div>
    </Section>
  );
}
