"use client";

import {useEffect,useMemo,useState} from "react";
import {event,team} from "../lib/race-data";
import {sampleResults,summarizeResults} from "../lib/live-results";
import type {LiveResult,LiveSummary,RunnerStatus} from "../lib/live-results";
import EstimatedCourseMap from "../components/EstimatedCourseMap";

type Feed={source:"test"|"spreadsheet";results:LiveResult[];summary:LiveSummary;comments?:string[];polledAt:string};
type Filter="all"|RunnerStatus;
type SortKey="standing"|"name"|"yards"|"last"|"average"|"rest";

const statusPriority:Record<RunnerStatus,number>={on_course:0,out:1};
const sampleComments=["Joshua feels he can go strong.","Kanishk had a fast lap."];

function formatDuration(seconds:number|null){
  if(seconds===null||!Number.isFinite(seconds))return "—";
  const value=Math.max(0,Math.round(seconds));
  return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
}

function statusLabel(status:RunnerStatus){return {on_course:"ON COURSE",out:"OUT"}[status];}

export default function Home(){
  const [feed,setFeed]=useState<Feed>({source:"test",results:sampleResults,summary:summarizeResults(sampleResults),comments:sampleComments,polledAt:new Date().toISOString()});
  const [filter,setFilter]=useState<Filter>("all");
  const [sortKey,setSortKey]=useState<SortKey>("standing");
  const [sortDirection,setSortDirection]=useState<"asc"|"desc">("asc");
  const [now,setNow]=useState(Date.now());

  useEffect(()=>{
    let mounted=true;
    const load=async()=>{try{const response=await fetch(`/api/live?_=${Date.now()}`,{cache:"no-store"});if(response.ok&&mounted)setFeed(await response.json());}catch{}};
    load();const refresh=window.setInterval(load,20000);return()=>{mounted=false;window.clearInterval(refresh)};
  },[]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[]);

  const results=feed.results;
  const active=results.filter(row=>row.status==="on_course");
  const currentYard=feed.summary?.currentYard||Math.max(1,...active.map(row=>row.currentYard));
  const stillIn=feed.summary?.stillIn??active.length;
  const totalDistance=feed.summary?.teamDistanceKm??results.reduce((sum,row)=>sum+row.yardsCompleted*event.distance,0);
  const averageLap=feed.summary?.averageLapSeconds??null;
  const averageRest=feed.summary?.averageRestSeconds??null;
  const nextBellAt=new Date(Math.ceil((now+1)/3600000)*3600000);
  const nextBell=Math.max(0,Math.ceil((nextBellAt.getTime()-now)/1000));
  const nextBellLabel=nextBellAt.toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Asia/Singapore"});

  const ordered=useMemo(()=>results.filter(row=>{
    return filter==="all"||row.status===filter;
  }).sort((a,b)=>{
    let comparison=0;
    if(sortKey==="standing")comparison=statusPriority[a.status]-statusPriority[b.status]||b.yardsCompleted-a.yardsCompleted||(a.averageLapSeconds??99999)-(b.averageLapSeconds??99999);
    if(sortKey==="name")comparison=a.name.localeCompare(b.name);
    if(sortKey==="yards")comparison=b.yardsCompleted-a.yardsCompleted;
    if(sortKey==="last")comparison=(a.lastLapSeconds??99999)-(b.lastLapSeconds??99999);
    if(sortKey==="average")comparison=(a.averageLapSeconds??99999)-(b.averageLapSeconds??99999);
    if(sortKey==="rest")comparison=(3600-(b.averageLapSeconds??3600))-(3600-(a.averageLapSeconds??3600));
    return sortDirection==="asc"?comparison:-comparison;
  }),[results,filter,sortKey,sortDirection]);

  const chooseSort=(key:SortKey)=>{if(key===sortKey)setSortDirection(value=>value==="asc"?"desc":"asc");else{setSortKey(key);setSortDirection("asc")}};

  return <main>
    <header className="topbar">
      <a className="wordmark" href="#top" aria-label="Beach Backyard Ultra home"><img src="/bbu-wordmark.png" alt="Beach Backyard Ultra"/><b>TEAM SINGAPORE</b></a>
      <nav className="category-switch" aria-label="Race coverage">
        <a className="active" href="/">TEAM</a>
        <a href="/open">OPEN CATEGORY</a>
      </nav>
      <a className="stream" href="#athletes">VIEW STANDINGS <span>↓</span></a>
    </header>

    <aside className="yard-ticker" aria-label="Overheard on the Yard">
      <b>OVERHEARD ON THE YARD</b><div><span>{(feed.comments?.length?feed.comments:sampleComments).join("  ·  ")}</span></div>
    </aside>

    <section className="coverage-hero" id="top">
      <figure className="campaign-art" aria-label="Moving gallery of the fifteen Team Singapore runners">
        <div className="athlete-reel-track">{[0,1].map(group=><div className="athlete-reel-set" aria-hidden={group===1} key={group}>{team.map(runner=><article className="reel-athlete" key={`${group}-${runner.number}`}><div className="reel-photo" style={{backgroundImage:`url("${runner.photo}")`,backgroundPosition:runner.photoPosition}}/><div className="reel-name"><span>SGP · {String(runner.number).padStart(2,"0")}</span><b>{runner.name}</b></div></article>)}</div>)}</div>
        <figcaption><div><span>{event.dateLabel} · PUNGGOL, SINGAPORE</span><h1>JUST ONE<br/>MORE <em>YARD.</em></h1></div></figcaption>
      </figure>
      <div className="yard-display"><span>CURRENT YARD</span><strong>{String(currentYard).padStart(2,"0")}</strong><div className="bell-time"><small>NEXT BELL · SINGAPORE</small><b>{nextBellLabel}</b><em>{String(Math.floor(nextBell/60)).padStart(2,"0")}:{String(nextBell%60).padStart(2,"0")} TO GO</em></div></div>
    </section>

    <section className="live-kpis" id="live">
      <article><small>STILL IN</small><b>{stillIn}<i>/15</i></b><span>{stillIn} runners active</span></article>
      <article><small>TEAM DISTANCE</small><b>{totalDistance.toFixed(1)}<i>KM</i></b><span>Spreadsheet team total</span></article>
      <article><small>AVERAGE LAP</small><b>{formatDuration(averageLap)}</b><span>Active-field sheet average</span></article>
      <article><small>AVERAGE REST</small><b>{formatDuration(averageRest)}</b><span>Active-field sheet average</span></article>
    </section>
    <div className="sync-strip"><b>{feed.source==="spreadsheet"?"● LIVE DATA CONNECTED":"● TEST DATA"}</b><span>LAST SYNC {new Date(feed.polledAt).toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit",second:"2-digit"})} SGT · REFRESHES EVERY 20 SECONDS</span></div>

    <section className="live-course" id="course">
      <header><div><p>COURSE / PUNGGOL</p><h2>PACE-BASED<br/><span>TRACKER.</span></h2></div><div className="map-mode"><b>ESTIMATED · NOT GPS</b><span>6.75 KM GPX · WAO START + FINISH</span></div></header>
      <figure className="course-visual">
        <EstimatedCourseMap results={results} currentYard={currentYard} now={now}/>
        <figcaption><span>ESTIMATE USES EACH ACTIVE RUNNER&apos;S LAST LAP, OR AVERAGE LAP WHEN LAST LAP IS BLANK.</span><b>PACE CAN CHANGE · THIS IS NOT LIVE GPS</b></figcaption>
      </figure>
    </section>

    <section className="standings" id="athletes">
      <header><div><p>TEAM SINGAPORE / LIVE ORDER</p><h2>EVERY<br/><span>RUNNER.</span></h2></div></header>
      <div className="filter-row">{(["all","on_course","out"] as Filter[]).map(value=><button className={filter===value?"active":""} onClick={()=>setFilter(value)} key={value}>{value==="all"?`ALL ${results.length}`:`${statusLabel(value as RunnerStatus)} ${results.filter(row=>row.status===value).length}`}</button>)}</div>
      <div className="results-table-wrap"><table className="results-table">
        <thead><tr><th><button onClick={()=>chooseSort("standing")}># / STATUS</button></th><th><button onClick={()=>chooseSort("name")}>ATHLETE</button></th><th><button onClick={()=>chooseSort("yards")}>YARDS</button></th><th>DISTANCE</th><th><button onClick={()=>chooseSort("last")}>LAST LAP</button></th><th><button onClick={()=>chooseSort("average")}>AVG LAP</button></th><th><button onClick={()=>chooseSort("rest")}>REST / YARD</button></th><th>CURRENT</th></tr></thead>
        <tbody>{ordered.map((runner,index)=>{const athlete=team.find(item=>item.number===runner.bib);return <tr className={runner.status} key={runner.athleteId}>
          <td><div className="status-cell"><span className="standing-number">{String(index+1).padStart(2,"0")}</span><i className="status-light"/><small>{runner.statusLabel||statusLabel(runner.status)}</small></div></td>
          <td><div className="athlete-cell"><div className="table-athlete" style={{backgroundImage:`url("${athlete?.photo}")`,backgroundPosition:athlete?.photoPosition}}/><div className="athlete-meta"><b>{runner.name}</b><span>SGP · #{String(runner.bib).padStart(2,"0")}</span></div></div></td>
          <td><strong>{runner.yardsCompleted}</strong></td><td>{(runner.yardsCompleted*event.distance).toFixed(1)} <small>KM</small></td><td>{formatDuration(runner.lastLapSeconds)}</td><td>{formatDuration(runner.averageLapSeconds)}</td><td className="rest-value">{formatDuration(runner.averageLapSeconds===null?null:3600-runner.averageLapSeconds)}</td><td>{runner.status==="on_course"&&runner.progress>0?<span className="progress-cell"><i><u style={{width:`${runner.progress}%`}}/></i>{Math.round(runner.progress)}%</span>:<span className={`current-pill ${runner.status}`}>{runner.status==="on_course"?"RUNNING":"OUT"}</span>}</td>
        </tr>})}</tbody>
      </table></div>
      <p className="table-note">Default order: active athletes first, then most completed yards, then fastest average lap. Tap any underlined heading to reorder.</p>
    </section>

    <section className="team-section" id="team"><header className="section-title"><div><p>THE NATIONAL TEAM / 2026</p><h2>SINGAPORE&apos;S<br/>FIFTEEN.</h2></div><p className="section-intro">All fifteen athletes contribute equally to the national score. The nation with the greatest combined yard total wins.</p></header><div className="team-grid">{team.map(r=><article className="team-card has-photo" key={r.number}><div className="athlete-photo" role="img" aria-label={`${r.name}, Team Singapore athlete`} style={{backgroundImage:`linear-gradient(to top,rgba(5,6,5,.85),transparent 65%),url("${r.photo}")`,backgroundPosition:r.photoPosition}}><small>{String(r.number).padStart(2,"0")}</small></div><div className="athlete-info"><p>{r.champion?"2024 NATIONAL CHAMPION":"TEAM SINGAPORE"}</p><h3>{r.name}</h3><span>SGP <i/> 2026</span></div></article>)}</div></section>

    <section className="sponsors"><p>EVENT PARTNERS</p><h2>SUPPORTED<br/>BY.</h2><img src="/sponsors.png" alt="Red Dot Running Company and WAF"/></section>

    <footer className="footer"><div className="footer-brand"><img src="/bbu-wordmark.png" alt="Beach Backyard Ultra"/><strong>Just one more yard.</strong></div><p>WORLD SATELLITE TEAM CHAMPIONSHIPS<br/>{event.dateLabel} · {event.startLabel}</p><div><a href="https://fatburdevents.com/beachbackyard" target="_blank" rel="noreferrer">OFFICIAL EVENT INFO ↗</a><small>LIVE FORMAT INSPIRED BY MODERN BACKYARD COVERAGE</small></div></footer>
  </main>;
}
