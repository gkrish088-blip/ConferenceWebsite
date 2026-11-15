import { media } from "../content/media";
import styles from "../styles/media.module.css";
export function ScienceGallery() {
  return (
    <div
      className={styles.science}
      role="group"
      aria-label={media.scienceTitle}
    >
      {media.science.map((image) => (
        <figure key={image.src}>
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
          />
          <figcaption>{image.alt}</figcaption>
        </figure>
      ))}
    </div>
  );
}
