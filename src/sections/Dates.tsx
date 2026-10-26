import React from "react";
import { dates, site } from "../content";
import {
  formatMilestoneDate,
  getMilestoneStatuses,
  getRiverPath,
  getRiverPoints,
  getVerticalRiverPath,
} from "../lib/dates";
import { Section } from "../components/Section";
import styles from "../styles/site.module.css";

export function DatesSection() {
  const title = site.nav.find((item) => item.id === "dates")?.label ?? "";
  const [now, setNow] = React.useState(Date.now());
  const milestones = getMilestoneStatuses(dates.milestones, now);
  const viewWidth = 1120;
  const viewHeight = 420;
  const labelWidth = 180;
  const points = getRiverPoints(
    milestones.length,
    viewWidth,
    viewHeight,
    labelWidth,
  );
  const path = getRiverPath(points);
  const mobilePath = getVerticalRiverPath(milestones.length);

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <Section id="dates" title={title}>
      {milestones.length === 0 ? (
        <p className={styles.emptyText}>{dates.emptyText}</p>
      ) : (
        <>
          <div className={styles.pipelineDesktop} data-desktop-pipeline>
            <svg
              className={styles.pipelineSvg}
              viewBox={`0 0 ${viewWidth} ${viewHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className={styles.riverBankPath} d={path} />
              <path className={styles.riverPath} d={path} />
              {milestones.map((milestone, index) => {
                const point = points[index];
                const above = index % 2 === 0;
                const staggered =
                  milestones.length >= 12 && Math.floor(index / 2) % 2 === 1;
                const reach = staggered ? 128 : 24;
                return (
                  <line
                    className={styles.milestoneLeader}
                    key={`${milestone.id}-leader`}
                    x1={point.x}
                    y1={point.y}
                    x2={point.x}
                    y2={point.y + (above ? -reach : reach)}
                  />
                );
              })}
              {milestones.map((milestone, index) => {
                const point = points[index];
                const statusClass =
                  styles[
                    `node${milestone.status[0].toUpperCase()}${milestone.status.slice(1)}` as keyof typeof styles
                  ];
                return (
                  <circle
                    className={`${styles.pipelineNode} ${statusClass}`}
                    cx={point.x}
                    cy={point.y}
                    r={milestone.status === "next" ? 9 : 6}
                    key={milestone.id}
                    aria-hidden="true"
                    data-milestone-node
                  />
                );
              })}
            </svg>
            <ol className={styles.pipelineLabels}>
              {milestones.map((milestone, index) => {
                const point = points[index];
                const above = index % 2 === 0;
                const staggered =
                  milestones.length >= 12 && Math.floor(index / 2) % 2 === 1;
                return (
                  <li
                    className={`${styles.milestoneLabel} ${above ? styles.labelAbove : styles.labelBelow}${staggered ? ` ${styles.labelStaggered}` : ""}`}
                    style={{
                      left: `${(point.x / viewWidth) * 100}%`,
                      top: `${(point.y / viewHeight) * 100}%`,
                      width: `${(labelWidth / viewWidth) * 100}%`,
                    }}
                    key={milestone.id}
                    data-status={milestone.status}
                    data-milestone-label
                  >
                    <h3>{milestone.label}</h3>
                    <time dateTime={milestone.date}>
                      {formatMilestoneDate(milestone.date, milestone.showTime)}
                    </time>
                    {milestone.note && <p>{milestone.note}</p>}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className={styles.pipelineMobile}>
            <svg
              className={styles.mobileRiverSvg}
              viewBox={`0 0 30 ${milestones.length * 120}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className={styles.riverBankPath} d={mobilePath} />
              <path className={styles.riverPath} d={mobilePath} />
            </svg>
            <ol className={styles.mobileMilestones}>
              {milestones.map((milestone) => (
                <li
                  className={styles.mobileMilestone}
                  key={milestone.id}
                  data-status={milestone.status}
                >
                  <span
                    className={`${styles.mobileNode} ${styles[`node${milestone.status[0].toUpperCase()}${milestone.status.slice(1)}` as keyof typeof styles]}`}
                    aria-hidden="true"
                  />
                  <div>
                    <h3>{milestone.label}</h3>
                    <time dateTime={milestone.date}>
                      {formatMilestoneDate(milestone.date, milestone.showTime)}
                    </time>
                    {milestone.note && <p>{milestone.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </Section>
  );
}
