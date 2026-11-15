import { hospitality } from "../content";
import styles from "../styles/site.module.css";

type HospitalityImagesProps = {
  images: (typeof hospitality.items)[number]["images"];
};

export function HospitalityImages({ images }: HospitalityImagesProps) {
  if (images.length === 0) return null;
  return (
    <div className={styles.hospitalityGallery}>
      {images.map((image) => (
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
              <a href={image.credit.sourceUrl}>{image.credit.author}</a>
              {" · "}
              <a href={image.credit.licenceUrl}>{image.credit.licence}</a>
              {" · "}
              {image.credit.changes}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
