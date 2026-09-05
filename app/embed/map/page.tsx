"use client";

import {useEffect,useState} from "react";
import EstimatedCourseMap from "../../../components/EstimatedCourseMap";
import {sampleResults,summarizeResults} from "../../../lib/live-results";
import type {LiveResult,LiveSummary} from "../../../lib/live-results";

type Feed={source:"test"|"spreadsheet";results:LiveResult[];summary:LiveSummary;polledAt:string};

export default function EmbeddedMap(){
  const [feed,setFeed]=useState<Feed>({source:"test",results:sampleResults,summary:summarizeResults(sampleResults),polledAt:new Date().toISOString()});
  const [now,setNow]=useState(Date.now());

  useEffect(()=>{
    let mounted=true;
    const load=async()=>{try{const response=await fetch(`/api/live?_=${Date.now()}`,{cache:"no-store"});if(response.ok&&mounted)setFeed(await response.json());}catch{}};
    load();const refresh=window.setInterval(load,20000);return()=>{mounted=false;window.clearInterval(refresh)};
  },[]);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer)},[]);

  return <main className="embed-map-page">
    <EstimatedCourseMap results={feed.results} currentYard={feed.summary.currentYard} now={now}/>
    <footer><b>{feed.source==="spreadsheet"?"● LIVE SHEET CONNECTED":"● TEST DATA"}</b><span>PACE ESTIMATE · REFRESHES EVERY 20 SECONDS</span></footer>
  </main>;
}
