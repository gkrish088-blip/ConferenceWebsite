import styles from "../styles/site.module.css";

const contourPaths = [
  "M-90 280 C70 220 110 180 255 205 S445 300 590 250 770 150 910 170 1070 250 1260 185",
  "M-100 315 C60 255 130 220 265 238 S445 330 600 285 780 190 918 205 1080 280 1275 220",
  "M-110 350 C55 290 145 258 278 272 S455 365 610 320 790 230 928 243 1090 315 1290 258",
  "M-120 385 C50 325 155 295 290 307 S465 400 620 355 800 270 940 280 1100 350 1305 295",
  "M-75 110 C90 155 180 95 300 110 S465 175 590 135 755 45 910 72 1070 140 1260 95",
  "M-65 75 C100 120 190 60 310 75 S475 140 600 100 765 10 920 37 1080 105 1270 60",
];

export function ContourLines() {
  return (
    <svg
      className={styles.contourLines}
      viewBox="0 0 1180 470"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {contourPaths.map((path, index) => (
        <path
          className={styles.contourPath}
          d={path}
          pathLength={1}
          key={index}
          style={{ animationDelay: `${0.32 + index * 0.08}s` }}
        />
      ))}
    </svg>
  );
}
