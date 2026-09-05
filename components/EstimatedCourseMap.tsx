"use client";

import {useState} from "react";
import type {MouseEvent} from "react";
import type {LiveResult} from "../lib/live-results";

type Point={x:number;y:number};

// Projected from the organizer-supplied BBU 2026 GPX track. The final point is
// visually snapped to the first so every yard closes at the WAO Fitness hub.
const course:Point[]=[
  {x:388.7,y:544.9},{x:395.7,y:551.4},{x:469.8,y:459.2},{x:500.6,y:434.9},
  {x:515.7,y:423.1},{x:517.1,y:416.7},{x:511,y:408.6},{x:505.6,y:401.7},
  {x:508.6,y:402.2},{x:514.8,y:407.6},{x:518.7,y:407.6},{x:518.5,y:400.8},
  {x:511.7,y:396.3},{x:513.8,y:395.4},{x:520.9,y:400.8},{x:527,y:404.8},
  {x:535.4,y:405.2},{x:548.8,y:396.3},{x:575.3,y:379.4},{x:618.5,y:354.8},
  {x:644.6,y:324.9},{x:625.5,y:306.7},{x:606.8,y:291.4},{x:606.7,y:243.4},
  {x:539.8,y:201.5},{x:508.4,y:184.1},{x:469.1,y:151.8},{x:369.2,y:60},
  {x:483.5,y:162.7},{x:528.6,y:193.9},{x:603.9,y:239.9},{x:606.6,y:284.4},
  {x:638.3,y:311.6},{x:641.1,y:339.5},{x:614.7,y:358.6},{x:572.9,y:383.7},
  {x:531,y:407.1},{x:517.5,y:398.3},{x:511.2,y:396},{x:517,y:400.6},
  {x:519.2,y:406.5},{x:512.6,y:407.2},{x:505.7,y:402.2},{x:513,y:410.6},
  {x:517.2,y:420.7},{x:511.7,y:425.1},{x:490.9,y:442.7},{x:464.5,y:464.1},
  {x:446.8,y:484.8},{x:430.5,y:509.3},{x:406.5,y:539.9},{x:390.6,y:557.1},
  {x:367,y:583},{x:350.4,y:600.8},{x:320.8,y:641.5},{x:311.8,y:663.5},
  {x:305.7,y:680.8},{x:301.4,y:693},{x:322.9,y:638},{x:345.4,y:606.6},
  {x:367.9,y:582.7},{x:389.7,y:559.2},{x:395.4,y:551.9},{x:384.9,y:542.9},
  {x:388.7,y:544.9},
];

const courseLengths=course.slice(1).map((point,index)=>Math.hypot(point.x-course[index].x,point.y-course[index].y));
const totalCourseLength=courseLengths.reduce((sum,length)=>sum+length,0);
const startFinish=course[0];
const northTurn=course[27];
const southTurn=course[57];

function coursePhase(progress:number){
  if(progress>=1)return "AT WAO / RECOVERING";
  if(progress<.408)return "NORTH LEG";
  if(progress<.815)return "RETURNING TO WAO";
  if(progress<.898)return "SOUTH LEG";
  return "FINAL RETURN TO WAO";
}

function pointAlongCourse(progress:number):Point{
  let remaining=Math.max(0,Math.min(1,progress))*totalCourseLength;
  for(let index=0;index<courseLengths.length;index++){
    const segment=courseLengths[index];
    if(remaining<=segment){
      const ratio=segment===0?0:remaining/segment;
      return {x:course[index].x+(course[index+1].x-course[index].x)*ratio,y:course[index].y+(course[index+1].y-course[index].y)*ratio};
    }
    remaining-=segment;
  }
  return course[course.length-1];
}

function formatClock(seconds:number){
  const value=Math.max(0,Math.floor(seconds));
  return `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
}

export default function EstimatedCourseMap({results,currentYard,now}: {results:LiveResult[];currentYard:number;now:number}){
  const [zoom,setZoom]=useState(1);
  const [zoomOrigin,setZoomOrigin]=useState({x:50,y:50});
  const active=results.filter(runner=>runner.status==="on_course");
  const elapsedSeconds=Math.floor((now/1000)%3600);
  const estimates=active.map((runner,index)=>{
    const predictedSeconds=Math.max(1,runner.lastLapSeconds??runner.averageLapSeconds??3600);
    const lapProgress=Math.min(1,elapsedSeconds/predictedSeconds);
    const point=pointAlongCourse(lapProgress);
    const angle=(index%6)*(Math.PI/3);
    const ring=Math.floor(index/6)*7;
    return {
      runner,
      x:point.x+Math.cos(angle)*ring,
      y:point.y+Math.sin(angle)*ring,
      lapProgress,
      direction:coursePhase(lapProgress),
      predictedSeconds,
    };
  });
  const routePoints=course.map(point=>`${point.x},${point.y}`).join(" ");

  const zoomAt=(event:MouseEvent<HTMLDivElement>)=>{
    const bounds=event.currentTarget.getBoundingClientRect();
    setZoomOrigin({x:((event.clientX-bounds.left)/bounds.width)*100,y:((event.clientY-bounds.top)/bounds.height)*100});
    setZoom(value=>value>=2.2?1:Math.min(2.2,value+.4));
  };

  return <div className="estimated-map">
    <div className="estimated-map__stage" onClick={zoomAt} style={{transform:`scale(${zoom})`,transformOrigin:`${zoomOrigin.x}% ${zoomOrigin.y}%`}} aria-label="Course map. Select the map or use the controls to zoom.">
      <div className="estimated-map__terrain"/>
      <svg viewBox="0 0 946 753" role="img" aria-label={`Actual BBU 2026 GPX loop with estimated locations of ${active.length} active runners on yard ${currentYard}`}>
        <defs>
          <pattern id="coordinate-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" className="estimated-grid-line"/>
          </pattern>
        </defs>
        <rect width="946" height="753" fill="url(#coordinate-grid)"/>
        <text className="estimated-map-label" x="42" y="67">BBU 2026 · GPS COURSE</text>
        <text className="estimated-map-coordinate" x="42" y="91">PUNGGOL, SINGAPORE</text>
        <polyline className="estimated-route-halo" points={routePoints}/>
        <polyline className="estimated-route-line" points={routePoints}/>
        <g className="estimated-course-point" transform={`translate(${northTurn.x} ${northTurn.y})`}>
          <circle r="5"/><text x="14" y="4">NORTH TURN</text>
        </g>
        <g className="estimated-course-point" transform={`translate(${southTurn.x} ${southTurn.y})`}>
          <circle r="5"/><text x="14" y="4">SOUTH TURN</text>
        </g>
        <g className="estimated-start" transform={`translate(${startFinish.x} ${startFinish.y})`}>
          <title>WAO Fitness Punggol · shared start and finish for every yard</title>
          <circle r="14"/><circle className="estimated-start-core" r="5"/>
          <text x="24" y="-8">WAO FITNESS</text><text className="estimated-start-sub" x="24" y="8">START + FINISH</text>
        </g>
        {estimates.map(({runner,x,y,lapProgress,direction,predictedSeconds})=><g className="estimated-runner" transform={`translate(${x} ${y})`} key={runner.athleteId}>
          <title>{`${runner.name} · ${direction} · ${Math.round(lapProgress*100)}% estimated · last/avg basis ${formatClock(predictedSeconds)}`}</title>
          <circle r="12"/><text y="3">{runner.bib}</text>
        </g>)}
      </svg>
    </div>
    <div className="estimated-map__zoom" aria-label="Map zoom controls">
      <button type="button" onClick={event=>{event.stopPropagation();setZoom(value=>Math.min(2.2,value+.4))}} aria-label="Zoom in">+</button>
      <button type="button" onClick={event=>{event.stopPropagation();setZoom(value=>Math.max(1,value-.4))}} aria-label="Zoom out">−</button>
      <button type="button" onClick={event=>{event.stopPropagation();setZoom(1);setZoomOrigin({x:50,y:50})}}>RESET</button>
    </div>
    <div className="estimated-map__hud">
      <span><i/> PACE ESTIMATE</span>
      <strong>YARD {String(currentYard).padStart(2,"0")}</strong>
      <b>{formatClock(elapsedSeconds)} <small>FROM BELL</small></b>
      <em>{active.length} ACTIVE MARKERS</em>
    </div>
    <div className="estimated-map__method"><b>ONE COMPLETE YARD · START + FINISH AT WAO</b><span>Actual BBU 2026 GPX · 6.75 km · Tap the map to zoom</span></div>
  </div>;
}
