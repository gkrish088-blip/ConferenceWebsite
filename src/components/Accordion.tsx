import React from "react";
import { hospitality } from "../content";
import { RichText } from "./RichText";
import styles from "../styles/site.module.css";

type HospitalityItem = (typeof hospitality.items)[number];

export function HospitalityAccordion() {
  const [openIds, setOpenIds] = React.useState<string[]>([]);

  const openFromHash = React.useCallback((hash: string) => {
    const item = hospitality.items.find(
      (entry) => `#hospitality-${entry.id}` === hash,
    );
    if (!item) return;

    setOpenIds((current) =>
      current.includes(item.id) ? current : [...current, item.id],
    );
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() =>
        document
          .getElementById(`hospitality-${item.id}`)
          ?.scrollIntoView({ block: "start" }),
      );
    });
  }, []);

  React.useEffect(() => {
    openFromHash(window.location.hash);
    const handleHashChange = () => openFromHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [openFromHash]);

  const handleIntroAnchor = (url: string) => {
    const isHospitalityItem = hospitality.items.some(
      (item) => `#hospitality-${item.id}` === url,
    );
    if (!isHospitalityItem) return false;
    window.history.pushState(null, "", url);
    openFromHash(url);
    return true;
  };

  const toggle = (item: HospitalityItem) => {
    setOpenIds((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
  };

  return (
    <>
      <RichText
        text={hospitality.intro}
        className={styles.hospitalityIntro}
        onAnchorClick={handleIntroAnchor}
      />
      <div className={styles.accordionList}>
        {hospitality.items.map((item) => {
          const isOpen = openIds.includes(item.id);
          const panelId = `panel-hospitality-${item.id}`;
          return (
            <article className={styles.accordionItem} key={item.id}>
              <h3
                className={styles.accordionHeading}
                id={`hospitality-${item.id}`}
              >
                <button
                  className={styles.accordionTrigger}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item)}
                >
                  <span>{item.title}</span>
                  <span className={styles.accordionIcon} aria-hidden="true" />
                </button>
              </h3>
              <div
                className={`${styles.accordionPanel}${isOpen ? ` ${styles.accordionPanelOpen}` : ""}`}
                id={panelId}
                role="region"
                aria-labelledby={`hospitality-${item.id}`}
                aria-hidden={!isOpen}
                inert={!isOpen}
              >
                <div className={styles.accordionPanelInner}>
                  <div className={styles.accordionBody}>
                    <RichText text={item.body} />
                    {item.images.map((image, index) => (
                      <img
                        className={styles.hospitalityImage}
                        src={image.src}
                        alt={image.alt}
                        style={{ objectPosition: image.focus }}
                        key={`${item.id}-${index}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
