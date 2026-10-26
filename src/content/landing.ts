import aboutData from "./about.json";
import siteData from "./site.json";
import { aboutSchema, siteSchema } from "./schema";

export const site = siteSchema.parse(siteData);
export const about = aboutSchema.parse(aboutData);
