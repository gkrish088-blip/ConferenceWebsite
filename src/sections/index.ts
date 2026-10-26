import type { ComponentType } from "react";
import { AboutSection } from "./About";
import { CommitteeSection } from "./Committee";
import { ContactSection } from "./Contact";
import { DatesSection } from "./Dates";
import { HospitalitySection } from "./Hospitality";
import { RegistrationSection } from "./Registration";
import { SpeakersSection } from "./Speakers";
import { ThemesSection } from "./Themes";

export const sectionRegistry: Record<string, ComponentType> = {
  about: AboutSection,
  themes: ThemesSection,
  dates: DatesSection,
  speakers: SpeakersSection,
  committee: CommitteeSection,
  registration: RegistrationSection,
  hospitality: HospitalitySection,
  contact: ContactSection,
};
