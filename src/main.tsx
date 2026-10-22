import React from 'react';
import { createRoot } from 'react-dom/client';
import { conference, navGroups, pages, pathFor, type Page } from './content';
import './styles.css';

const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

/** White placeholder keeps the exact slot visible until an approved asset arrives. */
function ImageSlot({ hint, ratio = '16 / 9', className = '' }: { hint: string; ratio?: string; className?: string }) {
  return <div className={`image-slot ${className}`} style={{ aspectRatio: ratio }} role="img" aria-label={`Image placeholder: ${hint}`}>
    <span className="slot-icon" aria-hidden="true">▧</span><span>IMAGE PLACEHOLDER</span><strong>{hint}</strong>
  </div>;
}

function PlaceholderCopy({ hint }: { hint: string }) {
  return <div className="placeholder-copy"><p className="hint">{hint}</p><div className="ghost-line"/><div className="ghost-line short"/><div className="ghost-line medium"/></div>;
}

function LinkButton({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <a className={`button ${light ? 'button-light' : 'button-primary'}`} href={href}>{children}<span aria-hidden="true">↗</span></a>;
}

function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  React.useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') { setMobileOpen(false); setOpenGroup(null); } }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);
  return <>
    <div className="utility-bar"><div className="container">A 2027 CONFERENCE WEBSITE CONCEPT <span>HOSTED AT IIT ROORKEE · INDIA</span></div></div>
    <header className="site-header"><div className="container header-inner">
      <a href="/" className="brand" aria-label="Conference 2027 home"><span className="brand-emblem">2027</span><span><strong>{conference.name}</strong><small>HOSTED AT IIT ROORKEE</small></span></a>
      <div className="header-organizers" aria-label="Organizers">{conference.organizers.map((name) => <span key={name}>{name}</span>)}</div>
      <button className="mobile-toggle" aria-controls="main-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? 'Close ✕' : 'Menu ☰'}</button>
    </div></header>
    <nav id="main-navigation" className={`nav-bar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Main navigation"><div className="container nav-inner">
      <a href="/" className="nav-item" aria-current={location.pathname === '/' ? 'page' : undefined}>Home</a>
      {navGroups.slice(0, 1).map((group) => <NavGroup key={group.label} {...group} open={openGroup === group.label} setOpen={setOpenGroup} />)}
      <a className="nav-item" href="/sponsoring-exhibition">Sponsoring & Exhibition</a>
      {navGroups.slice(1).map((group) => <NavGroup key={group.label} {...group} open={openGroup === group.label} setOpen={setOpenGroup} />)}
      <a className="nav-item" href="/newsletter">Newsletter</a><a className="nav-item" href="/about-us">About Us</a>
      <a className="nav-cta" href="/registration">Registration <span>↗</span></a>
    </div></nav>
  </>;
}

function NavGroup({ label, slugs, open, setOpen }: { label: string; slugs: string[]; open: boolean; setOpen: (value: string | null) => void }) {
  return <div className={`nav-group ${open ? 'is-open' : ''}`}>
    <button className="nav-item nav-trigger" aria-expanded={open} onClick={() => setOpen(open ? null : label)}>{label}<span aria-hidden="true">⌄</span></button>
    <div className="nav-dropdown">{slugs.map((slug) => { const page = pageBySlug.get(slug)!; return <a href={pathFor(slug)} key={slug}>{page.title}<span aria-hidden="true">↗</span></a>; })}</div>
  </div>;
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-grid"><div><span className="footer-mark">2027</span><h2>{conference.name}</h2><p>Organized by IIT Roorkee, CSIR–IIP Dehradun and HKUST.</p></div><div><h3>Explore</h3><a href="/scientific-program">Scientific Program</a><a href="/side-events">Side Events</a><a href="/venue">Venue</a><a href="/registration">Registration</a></div><div><h3>Plan your visit</h3><a href="/reaching-roorkee">Travel to Roorkee</a><a href="/accommodation">Accommodation</a><a href="/about-roorkee">About Roorkee</a><a href="/participant-clearance">Participant Clearance</a></div><div><h3>Contact</h3><p>[ Official conference email ]</p><p>IIT Roorkee<br/>Roorkee, Uttarakhand, India</p><a href="/about-us">About the organizers ↗</a></div></div><div className="container footer-bottom"><span>© 2027 Conference website concept</span><span>Content and image slots await organizer approval</span><a href="#top">Back to top ↑</a></div></footer>;
}

const sampleSessions = [
  { id: 'DEMO-01', title: '[ Opening session title ]', presenter: '[ Speaker name ]', theme: 'Plenary', type: 'Oral', day: 'Day 1' },
  { id: 'DEMO-02', title: '[ Research session title ]', presenter: '[ Presenter name ]', theme: 'Research', type: 'Oral', day: 'Day 2' },
  { id: 'DEMO-03', title: '[ Poster presentation title ]', presenter: '[ Presenter name ]', theme: 'Research', type: 'Poster', day: 'Day 3' },
];

function ProgrammeSearch() {
  const [query, setQuery] = React.useState('');
  const [theme, setTheme] = React.useState('All themes');
  const [type, setType] = React.useState('All types');
  const results = sampleSessions.filter((session) => {
    const text = Object.values(session).join(' ').toLowerCase();
    return text.includes(query.toLowerCase()) && (theme === 'All themes' || session.theme === theme) && (type === 'All types' || session.type === type);
  });
  return <div className="search-widget"><div className="search-grid"><label>Abstract ID, title or presenter<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sample entries…" /></label><label>Theme<select value={theme} onChange={(event) => setTheme(event.target.value)}><option>All themes</option><option>Plenary</option><option>Research</option></select></label><label>Contribution type<select value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option>Oral</option><option>Poster</option></select></label></div><div className="results-heading"><strong>{results.length} sample result{results.length === 1 ? '' : 's'}</strong><span>Demo records only · final fields and dataset pending</span></div><div className="results-list">{results.length ? results.map((item) => <div className="result" key={item.id}><span>{item.id} · {item.day}</span><strong>{item.title}</strong><small>{item.presenter} · {item.theme} · {item.type}</small></div>) : <p>No sample entries match these filters.</p>}</div></div>;
}

function Timetable() {
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
  const rows = [
    ['09:00', '[ Opening / keynote ]', '[ Plenary ]', '[ Plenary ]', '[ Plenary ]', '[ Closing ]'],
    ['10:30', '[ Break ]', '[ Break ]', '[ Break ]', '[ Break ]', '[ Break ]'],
    ['11:00', '[ Session ]', '[ Oral sessions ]', '[ Oral sessions ]', '[ Oral sessions ]', '[ Session ]'],
    ['13:00', '[ Lunch ]', '[ Lunch ]', '[ Lunch ]', '[ Lunch ]', '[ Lunch ]'],
    ['14:00', '[ Session ]', '[ Posters ]', '[ Workshops ]', '[ Posters ]', '[ Excursion ]'],
  ];
  return <div className="table-scroll"><table className="timetable"><caption>Illustrative schedule layout — replace all entries</caption><thead><tr><th>Time (IST)</th>{days.map((day) => <th key={day}>{day}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Home() {
  return <main id="main">
    <section className="hero"><div className="container hero-layout"><div className="hero-copy"><span className="eyebrow light">2027 · IIT ROORKEE, INDIA</span><p className="hero-date">{conference.date}<span className="hero-divider">|</span>{conference.venue}</p><h1>{conference.name}</h1><p className="hero-theme">{conference.theme}</p><p className="hero-hint">Official title, theme and dates will replace the labeled fields above.</p><div className="hero-actions"><LinkButton href="/registration" light>Registration</LinkButton><LinkButton href="/reaching-roorkee" light>Travel</LinkButton><a href="/side-events" className="hero-text-link">Side Events ↗</a></div></div><ImageSlot className="hero-image" hint="Conference hero / IIT Roorkee photograph · 1400 × 900 px" ratio="14 / 9" /></div><div className="hero-ribbon"><div className="container"><span>ORGANIZED BY</span>{conference.organizers.map((name) => <strong key={name}>{name}</strong>)}</div></div></section>
    <section className="container intro-section"><div className="section-heading"><span className="eyebrow">THE CONFERENCE</span><h2>A place for ideas<br/>to come together.</h2></div><div className="intro-side"><p className="hint">[ Add approved introduction: purpose, audience, scientific focus and expected outcomes. ]</p><div className="ghost-line"/><div className="ghost-line short"/><LinkButton href="/about-us">About the conference</LinkButton></div></section>
    <section className="program-section"><div className="container"><div className="section-top"><div><span className="eyebrow">01 / SCIENTIFIC PROGRAM</span><h2>Explore the programme</h2><p className="section-lede">A familiar timetable layout from the reference site, ready for the confirmed scientific schedule.</p></div><LinkButton href="/scientific-program">Full programme</LinkButton></div><Timetable/><p className="section-note">[ Add programme book PDF, final times, rooms and session links. ]</p></div></section>
    <section className="container search-section"><div className="section-top"><div><span className="eyebrow">02 / FIND A PRESENTATION</span><h2>Search the programme</h2><p className="section-lede">Try the search and filters with three clearly labeled demo records.</p></div></div><ProgrammeSearch/></section>
    <section className="feature-band"><div className="container feature-grid"><div><span className="eyebrow light">03 / TAKE PART</span><h2>Plan your conference</h2><p>[ Add approved participation details and external systems when available. ]</p></div><div className="feature-links"><a href="/abstract-submission"><span>01</span>Abstract Submission <b>↗</b></a><a href="/registration"><span>02</span>Registration <b>↗</b></a><a href="/side-events"><span>03</span>Side Events <b>↗</b></a><a href="/scientific-excursion"><span>04</span>Scientific Excursion <b>↗</b></a></div></div></section>
    <section className="container venue-section"><ImageSlot hint="Approved venue / campus photograph · 1200 × 800 px" ratio="3 / 2"/><div><span className="eyebrow">04 / EVENT VENUE</span><h2>Welcome to<br/>IIT Roorkee</h2><p className="hint">[ Add confirmed building name, venue facilities, accessibility and campus directions. ]</p><div className="venue-links"><a href="/venue">Explore the venue ↗</a><a href="/reaching-roorkee">How to reach IIT Roorkee ↗</a><a href="/accommodation">Accommodation ↗</a></div></div></section>
    <section className="organizers-section"><div className="container"><div className="section-top"><div><span className="eyebrow">05 / THE ORGANIZERS</span><h2>Three institutions,<br/>one gathering.</h2></div></div><div className="logo-grid">{conference.organizers.map((name) => <div className="logo-card" key={name}><ImageSlot hint={`Approved ${name} logo · 260 × 120 px`} ratio="13 / 6"/><strong>{name}</strong></div>)}</div><h3 className="small-heading">Partners & sponsors</h3><div className="sponsor-grid">{[1,2,3,4].map((number) => <ImageSlot key={number} hint={`Approved partner / sponsor logo ${number} · 220 × 100 px`} ratio="11 / 5" />)}</div></div></section>
    <section className="container information-section"><div className="direction-card"><span className="eyebrow">06 / REACH US</span><h2>Direction for the<br/>event hall</h2><p>IIT Roorkee<br/>Roorkee, Uttarakhand, India</p><p className="hint">[ Add hall name, map, contact email and event hours. ]</p><LinkButton href="/venue">Venue details</LinkButton></div><div className="date-card"><span className="eyebrow">07 / IMPORTANT DATES</span><h2>Mark your calendar</h2>{['Call for abstracts', 'Abstract deadline', 'Early registration closes', 'Conference dates'].map((item, index) => <div className="date-row" key={item}><span>0{index + 1}</span><strong>{item}</strong><em>[ Date to be confirmed ]</em></div>)}</div></section>
    <section className="gallery-section"><div className="container"><div className="section-top"><div><span className="eyebrow">08 / GALLERY & UPDATES</span><h2>From the conference</h2></div><a className="inline-link" href="/newsletter">All updates ↗</a></div><div className="gallery-grid">{[1,2,3,4].map((number) => <ImageSlot key={number} hint={`Approved poster / gallery image ${number} · 600 × 750 px`} ratio="4 / 5" />)}</div></div></section>
  </main>;
}

function DetailBlock({ page, item }: { page: Page; item: Page['sections'][number] }) {
  return <section className="detail-block"><div className="detail-label"><span className="eyebrow">{page.group.toUpperCase()}</span><h2>{item.title}</h2></div><div className="detail-body">{item.kind === 'image' ? <ImageSlot hint={item.hint} ratio="5 / 3" /> : item.kind === 'table' ? <><p className="hint">{item.hint}</p><div className="table-scroll"><table className="placeholder-table"><thead><tr><th>[ Column / category ]</th><th>[ Detail ]</th><th>[ Date / fee ]</th></tr></thead><tbody>{[1,2,3].map((number) => <tr key={number}><td>[ Entry {number} ]</td><td>••••••••••••</td><td>[ Pending ]</td></tr>)}</tbody></table></div></> : item.kind === 'list' ? <><p className="hint">{item.hint}</p>{[1,2,3].map((number) => <div className="placeholder-list" key={number}><span>0{number}</span><strong>[ Approved item title ]</strong><span>↗</span></div>)}</> : item.kind === 'form' ? <div className="form-placeholder"><span className="eyebrow">WORKFLOW PLACEHOLDER</span><h3>[ External system / form link ]</h3><p>{item.hint}</p><button disabled type="button">Opens when confirmed ↗</button></div> : <PlaceholderCopy hint={item.hint}/>}</div></section>;
}

function InnerPage({ page }: { page: Page }) {
  return <main id="main"><section className="page-hero"><div className="container"><div className="breadcrumbs"><a href="/">Home</a><span>/</span><span>{page.group}</span><span>/</span><strong>{page.title}</strong></div><span className="eyebrow light">CONFERENCE 2027 / {page.group.toUpperCase()}</span><h1>{page.title}</h1><p>{page.intro}</p></div></section><div className="container detail-layout"><aside className="page-sidebar"><strong>ON THIS PAGE</strong>{page.sections.map((item, index) => <a href={`#section-${index}`} key={item.title}>{item.title}</a>)}<hr/><span>RELATED PAGES</span>{pages.filter((entry) => entry.group === page.group && entry.slug !== page.slug).slice(0,4).map((entry) => <a href={pathFor(entry.slug)} key={entry.slug}>{entry.title} ↗</a>)}</aside><div className="detail-content"><div className="page-intro"><span className="eyebrow">PAGE CONTENT PREVIEW</span><p className="hint">[ Approved page copy, links and media will be added after organizer review. ]</p></div>{page.sections.map((item, index) => <div id={`section-${index}`} key={item.title}><DetailBlock page={page} item={item}/></div>)}</div></div><section className="inner-cta"><div className="container"><div><span className="eyebrow light">EXPLORE THE EVENT</span><h2>Continue planning your visit</h2></div><LinkButton href="/registration" light>Registration</LinkButton><LinkButton href="/reaching-roorkee" light>Travel information</LinkButton></div></section></main>;
}

function App() {
  const slug = decodeURIComponent(location.pathname.slice(1).replace(/\/$/, ''));
  const page = pageBySlug.get(slug);
  return <><div id="top"/><a className="skip-link" href="#main">Skip to content</a><Header/>{!slug ? <Home/> : page ? <InnerPage page={page}/> : <main id="main" className="not-found container"><span className="eyebrow">404</span><h1>Page not found</h1><p>That page is outside the current website plan.</p><LinkButton href="/">Back to home</LinkButton></main>}<Footer/></>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
