/** Edit provisional event details and the complete page inventory in this file. */
export const conference = {
  name: '[ Official conference name ]',
  theme: '[ Conference theme / tagline ]',
  date: '[ Conference dates, 2027 ]',
  venue: 'IIT Roorkee · Roorkee, India',
  organizers: ['IIT Roorkee', 'CSIR–IIP Dehradun', 'HKUST'],
};

export type Page = {
  slug: string;
  title: string;
  group: string;
  intro: string;
  sections: { title: string; hint: string; kind?: 'image' | 'table' | 'list' | 'form' }[];
};

const section = (title: string, hint: string, kind?: Page['sections'][number]['kind']) => ({ title, hint, kind });

export const pages: Page[] = [
  { slug: 'scientific-program', title: 'Scientific Program', group: 'Programs', intro: 'Schedule, sessions and presentation details will be published here.', sections: [section('Programme overview', 'Add approved overview and programme book.'), section('Daily timetable', 'Replace sample schedule with confirmed dates, rooms and sessions.', 'table'), section('Search presentations', 'Import accepted abstracts when ready.', 'form')] },
  { slug: 'side-events', title: 'Side Events', group: 'Programs', intro: 'Workshops and events alongside the main conference.', sections: [section('Events at a glance', 'Add event titles, dates, times and capacities.', 'list'), section('Event details', 'Add descriptions, conveners, locations and booking links.')] },
  { slug: 'scientific-excursion', title: 'Scientific Excursion', group: 'Programs', intro: 'Field visits and learning beyond the conference rooms.', sections: [section('Excursion overview', 'Add itinerary, destination, timing and eligibility.'), section('Excursion image', 'Approved destination photograph · 1200 × 720 px', 'image')] },
  { slug: 'sponsoring-exhibition', title: 'Sponsoring & Exhibition', group: 'Other', intro: 'Information for institutions and organizations joining the event.', sections: [section('Opportunities', 'Add approved packages, benefits and deadlines.', 'table'), section('Exhibitor enquiries', 'Add the official contact or application link.')] },
  { slug: 'abstract-submission', title: 'Abstract Submission', group: 'Attend', intro: 'Submission instructions and deadlines will appear here.', sections: [section('Submission information', 'Add themes, word limits, eligibility and important dates.'), section('Submit an abstract', 'Connect the confirmed external submission system.', 'form')] },
  { slug: 'author-guidelines', title: 'Author Guidelines', group: 'Attend', intro: 'Everything presenters need to prepare their contribution.', sections: [section('Presentation formats', 'Add oral, poster and other accepted formats.', 'list'), section('Templates and instructions', 'Add approved downloads and preparation guidance.')] },
  { slug: 'registration', title: 'Registration', group: 'Attend', intro: 'Categories, fees and policies will be confirmed by the organizers.', sections: [section('Registration information', 'Add opening date, inclusions and policies.'), section('Categories and fees', 'Add confirmed currency, categories, prices and deadlines.', 'table'), section('Register', 'Connect the official registration and payment provider.', 'form')] },
  { slug: 'participant-clearance', title: 'Participant Clearance', group: 'Attend', intro: 'Travel and participation clearance guidance will be listed here.', sections: [section('Requirements', 'Add verified institutional and visa requirements.'), section('Supporting documents', 'Add document instructions and official contact.')] },
  { slug: 'venue', title: 'Venue', group: 'Attend', intro: 'The conference will be hosted at IIT Roorkee, India.', sections: [section('Venue photograph', 'Approved venue photograph · 1200 × 720 px', 'image'), section('About the venue', 'Add confirmed building, room facilities and accessibility information.'), section('Finding your way', 'Add campus map and arrival instructions.', 'image')] },
  { slug: 'about-roorkee', title: 'About Roorkee', group: 'Hospitality', intro: 'An introduction to the host city and its surroundings.', sections: [section('City photograph', 'Approved Roorkee photograph · 1200 × 720 px', 'image'), section('Discover Roorkee', 'Add city introduction and visitor guidance.')] },
  { slug: 'delhi-airport', title: 'How to Exit Delhi Airport T3', group: 'Hospitality', intro: 'Arrival guidance for international and domestic visitors.', sections: [section('Arrival steps', 'Add verified terminal exit and meeting point directions.', 'list'), section('Airport map', 'Approved terminal diagram · 1200 × 720 px', 'image')] },
  { slug: 'reaching-roorkee', title: 'How to Reach IIT Roorkee', group: 'Hospitality', intro: 'Routes and travel choices for reaching the campus.', sections: [section('Travel options', 'Add verified rail, road and airport routes.', 'list'), section('Route map', 'Approved route map · 1200 × 720 px', 'image')] },
  { slug: 'accommodation', title: 'Accommodation', group: 'Hospitality', intro: 'Stay options and booking guidance for conference guests.', sections: [section('Accommodation options', 'Add approved hotels, campus rooms, rates and booking contacts.', 'table'), section('Booking notes', 'Add deadlines, cancellation terms and transport information.')] },
  { slug: 'campus-life', title: 'Life and Food at IIT Roorkee', group: 'Hospitality', intro: 'Plan your time on campus between sessions.', sections: [section('Campus life', 'Add facilities, accessibility and practical information.'), section('Dining', 'Add food locations, hours and dietary guidance.', 'list')] },
  { slug: 'uttarakhand', title: 'Uttarakhand Destination', group: 'Hospitality', intro: 'Discover the wider region surrounding Roorkee.', sections: [section('Destination image', 'Approved regional photograph · 1200 × 720 px', 'image'), section('Explore the region', 'Add approved destination information and travel advice.')] },
  { slug: 'scientific-committee', title: 'Scientific Committee', group: 'Committee', intro: 'Meet the people shaping the scientific programme.', sections: [section('Committee members', 'Add approved names, roles, affiliations and portraits.', 'list')] },
  { slug: 'local-committee', title: 'Local Organizing Committee', group: 'Committee', intro: 'Meet the team coordinating the conference in Roorkee.', sections: [section('Committee members', 'Add approved names, roles, affiliations and portraits.', 'list')] },
  { slug: 'newsletter', title: 'Newsletter', group: 'Other', intro: 'Follow announcements as the conference takes shape.', sections: [section('Latest updates', 'Add organizer approved announcements.', 'list'), section('Subscribe', 'Connect an approved newsletter service and privacy notice.', 'form')] },
  { slug: 'about-us', title: 'About Us', group: 'Other', intro: 'About the 2027 conference and its organizing institutions.', sections: [section('Conference vision', 'Add approved conference purpose and theme.'), section('Organizing institutions', 'Add approved institutional descriptions and links.', 'list')] },
];

export const navGroups = [
  { label: 'Programs', slugs: ['scientific-program', 'side-events', 'scientific-excursion'] },
  { label: 'Attend', slugs: ['abstract-submission', 'author-guidelines', 'registration', 'participant-clearance', 'venue'] },
  { label: 'Hospitality', slugs: ['about-roorkee', 'delhi-airport', 'reaching-roorkee', 'accommodation', 'campus-life', 'uttarakhand'] },
  { label: 'Committee', slugs: ['scientific-committee', 'local-committee'] },
];

export const pathFor = (slug: string) => `/${slug}`;
