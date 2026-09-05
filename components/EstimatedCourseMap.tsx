"use client";

import {useState} from "react";
import type {MouseEvent} from "react";
import type {LiveResult} from "../lib/live-results";

type Point={x:number;y:number};

const course:Point[]=[
  {x:250,y:742},{x:280,y:650},{x:320,y:555},{x:356,y:526},{x:415,y:458},
  {x:478,y:397},{x:485,y:375},{x:505,y:386},{x:530,y:370},{x:590,y:336},
  {x:627,y:310},{x:625,y:279},{x:592,y:254},{x:590,y:194},{x:531,y:169},
  {x:474,y:118},{x:410,y:54},
];

const courseLengths=course.slice(1).map((point,index)=>Math.hypot(point.x-course[index].x,point.y-course[index].y));
const totalCourseLength=courseLengths.reduce((sum,length)=>sum+length,0);

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
    const pathProgress=lapProgress<=.5?lapProgress*2:(1-lapProgress)*2;
    const point=pointAlongCourse(pathProgress);
    const angle=(index%6)*(Math.PI/3);
    const ring=Math.floor(index/6)*7;
    return {
      runner,
      x:point.x+Math.cos(angle)*ring,
      y:point.y+Math.sin(angle)*ring,
      lapProgress,
      direction:lapProgress>=1?"EXPECTED BACK":lapProgress<.5?"OUTBOUND":"RETURNING",
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
      <img src="/punggol-route-dark.png" alt="Dark illustrated map of the Punggol backyard ultra route"/>
      <div className="estimated-map__shade"/>
      <svg viewBox="0 0 946 753" role="img" aria-label={`Estimated locations of ${active.length} active runners on yard ${currentYard}`}>
      <polyline className="estimated-route-halo" points={routePoints}/>
      <polyline className="estimated-route-line" points={routePoints}/>
      <g className="estimated-start"><title>WAO Fitness Punggol · 1.394665, 103.916759</title><circle cx="250" cy="742" r="11"/><text x="271" y="746">WAO FITNESS · START / FINISH</text></g>
      <g className="estimated-turn"><circle cx="410" cy="54" r="5"/><text x="426" y="58">TURNAROUND</text></g>
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
    <div className="estimated-map__method"><b>WAO FITNESS · START / FINISH</b><span>1.394665, 103.916759 · Tap the map to zoom</span></div>
  </div>;
}
