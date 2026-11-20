import type { ReactNode } from "react";
import { media } from "../content/media";
import styles from "../styles/media.module.css";

export function PhotoGallery({ children }: { children: ReactNode }) {
  const image = media.gallery[0];
  return (
    <div className={styles.gallery}>
      <img
        className={styles.campusImage}
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        loading="lazy"
      />
      <div className={styles.campusIntro}>{children}</div>
    </div>
  );
}
