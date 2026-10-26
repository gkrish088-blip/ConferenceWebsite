import aboutData from "./about.json";
import committeeData from "./committee.json";
import contactData from "./contact.json";
import datesData from "./dates.json";
import hospitalityData from "./hospitality.json";
import registrationData from "./registration.json";
import siteData from "./site.json";
import speakersData from "./speakers.json";
import themesData from "./themes.json";
import {
  aboutSchema,
  committeeSchema,
  contactSchema,
  datesSchema,
  hospitalitySchema,
  registrationSchema,
  siteSchema,
  speakersSchema,
  themesSchema,
} from "./schema";

export const site = siteSchema.parse(siteData);
export const about = aboutSchema.parse(aboutData);
export const themes = themesSchema.parse(themesData);
export const dates = datesSchema.parse(datesData);
export const speakers = speakersSchema.parse(speakersData);
export const committee = committeeSchema.parse(committeeData);
export const registration = registrationSchema.parse(registrationData);
export const hospitality = hospitalitySchema.parse(hospitalityData);
export const contact = contactSchema.parse(contactData);

export const content = {
  site,
  about,
  themes,
  dates,
  speakers,
  committee,
  registration,
  hospitality,
  contact,
};
