import { useEffect, useRef } from "react";
import { hospitality } from "../content";
import { RichText } from "./RichText";
import styles from "../styles/site.module.css";

// Native disclosures preserve keyboard access and work before JavaScript loads.
export function HospitalityAccordion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const openFromHash = () => {
      const item = hospitality.items.find(
        (item) => `#hospitality-${item.id}` === window.location.hash,
      );
      if (!item) return;
      const details = ref.current?.querySelector<HTMLDetailsElement>(
        `#hospitality-${item.id}`,
      );
      if (details) {
        details.open = true;
        requestAnimationFrame(() => details.scrollIntoView({ block: "start" }));
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);
  return (
    <>
      <RichText
        text={hospitality.intro}
        className={styles.hospitalityIntro}
        onAnchorClick={(url) => {
          const details = ref.current?.querySelector<HTMLDetailsElement>(
            url.startsWith("#hospitality-") ? url : "details[data-missing]",
          );
          if (!details) return false;
          details.open = true;
          window.history.pushState(null, "", url);
          details.scrollIntoView({ block: "start" });
          return true;
        }}
      />
      <div ref={ref} className={styles.accordionList}>
        {hospitality.items.map((item) => (
          <details
            className={styles.nativeAccordion}
            key={item.id}
            id={`hospitality-${item.id}`}
          >
            <summary className={styles.accordionTrigger}>
              <span>{item.title}</span>
              <span className={styles.accordionIcon} aria-hidden="true" />
            </summary>
            <div className={styles.hospitalityContent}>
              <RichText text={item.body} />
              <div className={styles.hospitalityGallery}>
                {item.images.map((image) => (
                  <figure className={styles.hospitalityFigure} key={image.src}>
                    <img
                      className={styles.hospitalityImage}
                      src={image.src}
                      alt={image.alt}
                      style={{ objectPosition: image.focus }}
                      loading="lazy"
                    />
                    {image.credit && (
                      <figcaption className={styles.hospitalityCredit}>
                        {image.credit.prefix}{" "}
                        <a href={image.credit.sourceUrl}>
                          {image.credit.author}
                        </a>
                        {" · "}
                        <a href={image.credit.licenceUrl}>
                          {image.credit.licence}
                        </a>
                        {" · "}
                        {image.credit.changes}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
