"use client";

import {useEffect,useState} from "react";
import EstimatedCourseMap from "../../components/EstimatedCourseMap";
import {event} from "../../lib/race-data";

const categories=[
  {name:"Taster",limit:"6 yards"},
  {name:"Challenger",limit:"12 yards"},
  {name:"Miler",limit:"24 yards"},
  {name:"Backyard Ultra",limit:"Last one standing"},
];

const previewSlots=Array.from({length:15},(_,index)=>({
  bib:index+1,
  name:`Athlete ${String(index+1).padStart(2,"0")}`,
  category:categories[index%categories.length].name,
}));

export default function OpenCategory(){
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[]);

  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="Beach Backyard Ultra Open Category home"><img src="/bbu-wordmark.png" alt="Beach Backyard Ultra"/><b>OPEN CATEGORY</b></a>
      <nav className="category-switch" aria-label="Race coverage">
        <a href="/">TEAM</a>
        <a className="active" href="/open">OPEN CATEGORY</a>
      </nav>
      <a className="stream" href="#athletes">VIEW STANDINGS <span>↓</span></a>
    </header>

    <aside className="yard-ticker open-ticker" aria-label="Open category update">
      <b>OPEN CATEGORY</b><div><span>ATHLETE ROSTER AND LIVE FEED TO FOLLOW  ·  FIRST BELL 08:00 SGT  ·  SATURDAY 17 OCTOBER 2026</span></div>
    </aside>

    <section className="coverage-hero open-hero" id="top">
      <figure className="campaign-art open-campaign" aria-label="Open category athlete placeholders">
        <div className="athlete-reel-track">{[0,1].map(group=><div className="athlete-reel-set" aria-hidden={group===1} key={group}>{previewSlots.map(slot=><article className="reel-athlete open-reel-athlete" key={`${group}-${slot.bib}`}><div className="open-photo-placeholder"><span>BBU</span><strong>{String(slot.bib).padStart(2,"0")}</strong><small>PHOTO<br/>PLACEHOLDER</small></div><div className="reel-name"><span>{slot.category.toUpperCase()}</span><b>{slot.name}</b></div></article>)}</div>)}</div>
        <figcaption><div><span>{event.dateLabel} · PUNGGOL, SINGAPORE</span><h1>JUST ONE<br/>MORE <em>YARD.</em></h1></div></figcaption>
      </figure>
      <div className="yard-display preview-yard"><span>CURRENT YARD</span><strong>00</strong><div className="bell-time"><small>FIRST BELL · SINGAPORE</small><b>08:00</b><em>LIVE DATA TO FOLLOW</em></div></div>
    </section>

    <section className="open-category-strip" aria-label="Open race categories">
      {categories.map(item=><article key={item.name}><small>OPEN CATEGORY</small><b>{item.name}</b><span>{item.limit}</span></article>)}
    </section>

    <section className="live-kpis open-kpis">
      <article><small>STILL IN</small><b>—</b><span>Updates from the race feed</span></article>
      <article><small>FIELD DISTANCE</small><b>—<i>KM</i></b><span>Combined open-category total</span></article>
      <article><small>AVERAGE LAP</small><b>—</b><span>Active-field average</span></article>
      <article><small>AVERAGE REST</small><b>—</b><span>Active-field average</span></article>
    </section>
    <div className="sync-strip preview-sync"><b>● PRE-RACE PREVIEW</b><span>OPEN-CATEGORY SPREADSHEET CONNECTION PENDING</span></div>

    <section className="live-course" id="course">
      <header><div><p>COURSE / PUNGGOL</p><h2>PACE-BASED<br/><span>TRACKER.</span></h2></div><div className="map-mode"><b>ESTIMATED · NOT GPS</b><span>6.7056 KM · OUT &amp; BACK</span></div></header>
      <figure className="course-visual open-course-visual">
        <EstimatedCourseMap results={[]} currentYard={0} now={now}/>
        <div className="open-map-notice"><b>TRACKER READY</b><span>Estimated runner markers will appear when the open-category race feed is connected.</span></div>
        <figcaption><span>ESTIMATE WILL USE EACH ACTIVE RUNNER&apos;S LAST LAP, OR AVERAGE LAP WHEN LAST LAP IS BLANK.</span><b>PACE CAN CHANGE · THIS IS NOT LIVE GPS</b></figcaption>
      </figure>
    </section>

    <section className="standings open-standings" id="athletes">
      <header><div><p>OPEN CATEGORY / LIVE ORDER</p><h2>THE<br/><span>FIELD.</span></h2></div><p className="open-roster-note"><b>PREVIEW ROSTER</b><span>Names, bibs and category assignments will replace these temporary entries.</span></p></header>
      <div className="filter-row"><button className="active">ALL {previewSlots.length}</button><button>ON COURSE 0</button><button>OUT 0</button></div>
      <div className="results-table-wrap"><table className="results-table open-results-table">
        <thead><tr><th># / STATUS</th><th>ATHLETE</th><th>CATEGORY</th><th>YARDS</th><th>DISTANCE</th><th>LAST LAP</th><th>AVG LAP</th><th>CURRENT</th></tr></thead>
        <tbody>{previewSlots.map((slot,index)=><tr className="preview-row" key={slot.bib}>
          <td><div className="status-cell"><span className="standing-number">{String(index+1).padStart(2,"0")}</span><i className="status-light placeholder-light"/><small>PENDING</small></div></td>
          <td><div className="athlete-cell"><div className="table-athlete athlete-placeholder"><span>{String(slot.bib).padStart(2,"0")}</span></div><div className="athlete-meta"><b>{slot.name}</b><span>BIB TO FOLLOW</span></div></div></td>
          <td><strong className="category-value">{slot.category}</strong></td><td>—</td><td>— <small>KM</small></td><td>—</td><td>—</td><td><span className="current-pill pending">PENDING</span></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    <section className="team-section open-field-section"><header className="section-title"><div><p>THE OPEN FIELD / 2026</p><h2>ROSTER<br/>PENDING.</h2></div><p className="section-intro">These cards reserve the final athlete-photo layout. Real names, bibs, categories and images can be added without changing the page structure.</p></header><div className="team-grid">{previewSlots.map(slot=><article className="team-card" key={slot.bib}><div className="athlete-photo open-athlete-photo"><small>{String(slot.bib).padStart(2,"0")}</small><span>ATHLETE<br/>PHOTO</span></div><div className="athlete-info"><p>{slot.category.toUpperCase()}</p><h3>{slot.name}</h3><span>OPEN <i/> 2026</span></div></article>)}</div></section>

    <section className="sponsors"><p>EVENT PARTNERS</p><h2>SUPPORTED<br/>BY.</h2><img src="/sponsors.png" alt="Red Dot Running Company and WAF"/></section>

    <footer className="footer"><div className="footer-brand"><img src="/bbu-wordmark.png" alt="Beach Backyard Ultra"/><strong>Just one more yard.</strong></div><p>OPEN CATEGORIES<br/>{event.dateLabel} · 8:00 AM SGT</p><div><a href="https://fatburdevents.com/beach-backyard-registration" target="_blank" rel="noreferrer">OPEN CATEGORY DETAILS ↗</a><small>TASTER · CHALLENGER · MILER · BACKYARD ULTRA</small></div></footer>
  </main>;
}
