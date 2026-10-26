import { site } from "../content";
import { HospitalityAccordion } from "../components/Accordion";
import { Section } from "../components/Section";

export function HospitalitySection() {
  const title = site.nav.find((item) => item.id === "hospitality")?.label ?? "";
  return (
    <Section id="hospitality" title={title}>
      <HospitalityAccordion />
    </Section>
  );
}
