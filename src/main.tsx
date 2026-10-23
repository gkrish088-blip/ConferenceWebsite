import React from 'react';
import { createRoot } from 'react-dom/client';
import { conference, navigation, pages, pathFor, siteCopy, type Page } from './content';
import './styles.css';

const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

function ImageSlot({ hint, ratio = '16 / 9' }: { hint: string; ratio?: string }) {
  return <div className="image-slot" style={{ aspectRatio: ratio }} role="img" aria-label={hint}><span>IMAGE TO BE CONFIRMED</span><small>{hint}</small></div>;
}

function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  React.useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMobileOpen(false); setOpenGroup(null); } };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);
  return <header className="site-header"><div className="header-top shell">
    <a className="brand" href="/" aria-label="Conference home"><span className="brand-seal" aria-hidden="true">◉</span><span><b>भारतीय प्रौद्योगिकी संस्थान रुड़की</b><small>Indian Institute of Technology Roorkee</small></span></a>
    <div className="organizer-marks" aria-label="Other organizer identities pending approval">{conference.organizers.slice(1).map(name => <span key={name}>{name}</span>)}</div>
    <button className="menu-toggle" type="button" aria-expanded={mobileOpen} aria-controls="main-navigation" onClick={() => setMobileOpen(!mobileOpen)}><span className="menu-lines" aria-hidden="true">☰</span><span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span></button>
  </div><nav id="main-navigation" className={`site-nav ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation"><div className="shell nav-inner">
    {navigation.map(item => item.kind === 'page'
      ? <a key={item.slug} href={pathFor(item.slug)} aria-current={location.pathname.replace(/\/$/, '') === pathFor(item.slug) ? 'page' : undefined}>{pageBySlug.get(item.slug)?.title}</a>
      : item.kind === 'home'
        ? <a key="home" href="/" aria-current={location.pathname === '/' ? 'page' : undefined}>Home</a>
        : <NavGroup key={item.label} {...item} open={openGroup === item.label} setOpen={setOpenGroup}/>) }
  </div></nav></header>;
}

function NavGroup({ label, slugs, open, setOpen }: { label: string; slugs: string[]; open: boolean; setOpen: (value: string | null) => void }) {
  return <div className={`nav-group ${open ? 'open' : ''}`}><button type="button" aria-expanded={open} onClick={() => setOpen(open ? null : label)}>{label}<span aria-hidden="true">⌄</span></button><div className="nav-dropdown">{slugs.map(slug => <a key={slug} href={pathFor(slug)} aria-current={location.pathname.replace(/\/$/, '') === pathFor(slug) ? 'page' : undefined}>{pageBySlug.get(slug)?.title}</a>)}</div></div>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="section-heading"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>;
}

function Hero() {
  return <section className="hero"><div className="hero-shade"/><div className="hero-content shell"><p className="hero-meta"><span>▣ &nbsp;{conference.date}</span><span>♦ &nbsp;{siteCopy.location}</span></p><h1>{conference.name}</h1><p className="hero-theme">{conference.theme}</p><div className="countdown" aria-label="Conference date pending">{[['Days','pink'],['Hours','blue'],['Minutes','gold'],['Seconds','purple']].map(([label,color]) => <div className={`count-box ${color}`} key={label}><b>--</b><small>{label}</small></div>)}</div><div className="hero-actions"><a href="/registration">♟ Registration</a><a href="/reaching-roorkee">♧ Travel</a><a href="/side-events">▦ Side Event</a></div><p className="hero-status">{siteCopy.registrationStatus}</p></div></section>;
}

function Timetable() {
  const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6'];
  const rows = [['09.00–10.30','[ Opening ]','[ Session ]','[ Session ]','[ Session ]','[ Session ]','[ Closing ]'],['10.30–11.00','[ Break ]','','','','',''],['11.00–12.30','[ Session ]','[ Session ]','[ Session ]','[ Session ]','[ Session ]',''],['12.30–13.30','[ Lunch ]','','','','',''],['13.30–15.00','[ Session ]','[ Session ]','[ Session ]','[ Session ]','[ Session ]','']];
  return <div className="table-scroll"><table className="timetable"><caption>PROGRAMME — {siteCopy.programmeStatus}</caption><thead><tr><th>Timing (IST)</th>{days.map(day => <th key={day}>{day}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[0]}>{row.map((cell,index) => index === 0 ? <th key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function ProgrammeSearch() {
  const [query, setQuery] = React.useState('');
  return <div className="search-widget"><div className="search-title">SEARCH AS PER YOUR REQUIREMENT</div><div className="search-grid"><label>By Abstract ID :<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Enter here search by abstract id..."/></label><label>By Abstract Title :<input placeholder="Enter here search by abstract title..."/></label><label>By Presenter Name :<input placeholder="Enter here search by presenter name..."/></label><label>By Theme :<select defaultValue=""><option value="">-------Select------</option></select></label><label>By Contributions Type :<select defaultValue=""><option value="">-------Select------</option></select></label><label>By Affiliation :<input placeholder="Enter here search by affiliation..."/></label><label>By Country :<select defaultValue=""><option value="">-------Select------</option></select></label></div><button className="pink-button" type="button" disabled>Search Now</button><p className="data-note">Search will be enabled when the approved 2027 abstracts are supplied.</p></div>;
}

function Home() {
  return <main id="main"><Hero/><div className="announcement shell">{siteCopy.programmeStatus}</div><section className="stats-band"><div className="shell stats-grid">{['Conference Participants','Our Visionary Speakers','Organizers','Workshops'].map(item => <div key={item}><strong>—</strong><span>{item}</span></div>)}</div></section>
    <section className="content-section shell"><SectionHeading eyebrow="VARIOUS" title="Scientific Program"/><h3>PROGRAM — SCIENTIFIC ASSEMBLY</h3><h4>PLENARY ROOM</h4><Timetable/><h3 className="search-heading">Search</h3><p className="section-copy">Find presentations by abstract ID, title, presenter, affiliation, theme, contribution type or country once the confirmed programme is available.</p><ProgrammeSearch/></section>
    <section className="content-section shell"><SectionHeading eyebrow="EVENT" title="Organizers"/><div className="logo-grid">{conference.organizers.map(name => <div className="logo-card" key={name}><ImageSlot hint={`Approved ${name} logo · 260 × 120 px`} ratio="13 / 6"/><b>{name}</b></div>)}</div><h2 className="subheading">In coordination with</h2><div className="logo-grid small">{[1,2,3].map(i=><ImageSlot key={i} hint={`Coordination logo ${i} pending approval`} ratio="13 / 6"/>)}</div><h2 className="subheading">In Partnership with</h2><div className="logo-grid small">{[1,2,3].map(i=><ImageSlot key={i} hint={`Partner logo ${i} pending approval`} ratio="13 / 6"/>)}</div><h2 className="subheading">In Sponsorship with</h2><div className="logo-grid small">{[1,2,3,4,5,6].map(i=><ImageSlot key={i} hint={`Sponsor logo ${i} pending approval`} ratio="13 / 6"/>)}</div></section>
    <section className="contact-dates"><div className="shell contact-grid"><div><SectionHeading eyebrow="REACH US" title="Direction for the Event hall"/><div className="contact-tabs"><span>Time</span><span>Venue</span></div><p>{conference.date}</p><p>{conference.venue}</p><a className="pink-button link-button" href="/venue">Venue details</a></div><div><h2>Contact Info</h2><p>Local Organising Committee<br/>IIT Roorkee<br/>Roorkee, Uttarakhand, India</p><p>{siteCopy.contact}</p><SectionHeading eyebrow="EVENT" title="Important Dates"/><ul className="dates-list">{siteCopy.milestones.map(item=><li key={item}>{item}: <b>[ To be confirmed ]</b></li>)}</ul></div></div></section>
  </main>;
}

function DetailBody({ item }: { item: Page['sections'][number] }) {
  if (item.kind === 'image') return <ImageSlot hint={item.hint} ratio="5 / 3"/>;
  if (item.kind === 'form') return <div className="pending-panel"><p>{item.hint}</p><button disabled className="pink-button">Available when confirmed</button></div>;
  if (item.kind === 'table') return <><p>{item.hint}</p><div className="table-scroll"><table className="timetable"><thead><tr><th>Category</th><th>Details</th><th>Status</th></tr></thead><tbody><tr><td>[ To be confirmed ]</td><td>[ Organizer information pending ]</td><td>Pending</td></tr></tbody></table></div></>;
  if (item.kind === 'list') return <div className="pending-panel"><p>{item.hint}</p><ul><li>[ Approved items to be added ]</li></ul></div>;
  return <p>{item.hint}</p>;
}

function InnerPage({ page }: { page: Page }) {
  return <main id="main"><div className="inner-banner"><h1>{page.title}</h1></div><section className="content-section shell inner-content"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><span>{page.group}</span><span>›</span><strong>{page.title}</strong></nav><SectionHeading eyebrow="VARIOUS" title={page.title}/><p className="inner-intro">{page.intro}</p><div className="content-status" role="note"><b>Page structure ready for organizer review</b><span>Section headings are planned. Event details, links, images and policies will be added after confirmation.</span></div><div className="inner-layout"><div className="detail-content">{page.sections.map((item,index)=><section className="detail-block" id={`section-${index}`} key={item.title}><h3>{item.title}</h3><DetailBody item={item}/></section>)}</div><aside className="page-sidebar"><h3>On this page</h3>{page.sections.map((item,index)=><a href={`#section-${index}`} key={item.title}>{item.title}</a>)}<h3>Related pages</h3>{pages.filter(other=>other.group===page.group&&other.slug!==page.slug).slice(0,4).map(other=><a href={pathFor(other.slug)} key={other.slug}>{other.title}</a>)}</aside></div></section><section className="inner-callout"><div className="shell"><b>Explore the event</b><span>Continue planning your visit</span><a href="/registration">Registration ›</a><a href="/reaching-roorkee">Travel ›</a></div></section></main>;
}

function Footer() {
  return <footer className="site-footer"><div className="shell"><h2>{conference.name}</h2><div className="footer-links"><a href="/">Home</a><a href="/scientific-program">Scientific Program</a><a href="/venue">Venue</a><a href="/about-us">About Us</a></div><p>© 2027 Conference website prototype · Official content and organizer marks pending approval.</p></div></footer>;
}

function App() {
  const slug=decodeURIComponent(location.pathname.slice(1).replace(/\/$/,''));
  const page=pageBySlug.get(slug);
  return <><a className="skip-link" href="#main">Skip to content</a><Header/>{!slug?<Home/>:page?<InnerPage page={page}/>:<main id="main" className="shell not-found"><h1>Page not found</h1><a href="/">Back to home</a></main>}<Footer/><a className="back-to-top" href="#main" aria-label="Back to content">⌃</a></>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
