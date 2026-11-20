import { createContext, useContext, type ReactNode } from "react";
import styles from "../styles/site.module.css";

export const PageSection = createContext<string | undefined>(undefined);

export function Section({
  id,
  title,
  alternate = false,
  headingImage,
  children,
}: {
  id: string;
  title: string;
  alternate?: boolean;
  headingImage?: string;
  children: ReactNode;
}) {
  const Heading = useContext(PageSection) === id ? "h1" : "h2";
  const heading = (
    <Heading
      id={`${id}-heading`}
      className={
        headingImage
          ? `${styles.sectionHeading} ${styles.photoHeading}`
          : styles.sectionHeading
      }
      style={
        headingImage
          ? {
              backgroundImage: `linear-gradient(180deg, rgb(18 43 57 / 45%) 0%, rgb(18 43 57 / 81%) 52%, rgb(18 43 57 / 55%) 100%), url("${headingImage}")`,
            }
          : undefined
      }
    >
      {title}
    </Heading>
  );
  return (
    <section
      id={id}
      className={`${styles.section}${alternate ? ` ${styles.sectionAlternate}` : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className={styles.container}>
        {heading}
        {children}
      </div>
    </section>
  );
}
