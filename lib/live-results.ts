export type RunnerStatus = "on_course" | "out";

export type LapSplit = {
  yard: number;
  seconds: number;
};

export type LiveResult = {
  athleteId: string;
  bib: number;
  name: string;
  status: RunnerStatus;
  statusLabel?: string;
  yardsCompleted: number;
  currentYard: number;
  lastLapSeconds: number | null;
  averageLapSeconds: number | null;
  progress: number;
  updatedAt: string;
  note: string;
  laps: LapSplit[];
};

export type LiveSummary = {
  currentYard: number;
  stillIn: number;
  teamDistanceKm: number;
  averageLapSeconds: number | null;
  averageRestSeconds: number | null;
};

const samples: Array<[string,number,string,string,number,number,string,string,number,string,string]> = [
  ["SGP-001",1,"Joshua Toh","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-002",2,"Nguyen Dang Trung","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-003",3,"Wang Jian Jason","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-004",4,"Chris Timms","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-005",5,"Andrey Kolbasov","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-006",6,"Khoo Houw Ann","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-007",7,"Sophia Yee","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-008",8,"Kanishk Karan","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-009",9,"Zenton Yarm","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-010",10,"Lem Chee Ng","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-011",11,"Glenn Lee","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-012",12,"Lee Kok Cheu","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-013",13,"Leong Foo Fatt","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-014",14,"Quek Kok Kwang","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
  ["SGP-015",15,"Tan Qi Wei","DNS",0,0,"","",0,"2026-10-17T20:00:00+08:00",""],
];

export const sampleResults: LiveResult[] = samples.map(([athleteId,bib,name,status,yardsCompleted,currentYard,lastLap,averageLap,progress,updatedAt,note]) => ({
  athleteId,bib,name,status:normalizeStatus(status),statusLabel:status.toUpperCase(),yardsCompleted,currentYard,
  lastLapSeconds:parseDuration(lastLap),averageLapSeconds:parseDuration(averageLap),progress,updatedAt,note,laps:[],
}));

function normalize(value:string){return value.trim().toLowerCase().replace(/[^a-z0-9]/g,"");}

export function normalizeStatus(value:string):RunnerStatus{
  const status=normalize(value);
  if(status.includes("course")||status.includes("corral")||status==="in"||status==="active"||status.includes("continu")||status.includes("winner")||status.includes("lastman")||status.includes("lastone")||status==="assist"||status==="lms"||status==="los") return "on_course";
  return "out";
}

export function parseDuration(value:string|number|undefined):number|null{
  if(value===undefined||value===null||value==="") return null;
  if(typeof value==="number") return value<1?Math.round(value*86400):Math.round(value);
  const raw=String(value).trim();
  if(/^\d+(\.\d+)?$/.test(raw)){
    const number=Number(raw); return number<1?Math.round(number*86400):Math.round(number);
  }
  const parts=raw.split(":").map(Number);
  if(parts.some(Number.isNaN)) return null;
  if(parts.length===2) return parts[0]*60+parts[1];
  if(parts.length===3) return parts[0]*3600+parts[1]*60+parts[2];
  return null;
}

function parseCsvRows(csv:string):string[][]{
  const rows:string[][]=[]; let row:string[]=[]; let cell=""; let quoted=false;
  for(let i=0;i<csv.length;i++){
    const char=csv[i];
    if(char==='"'){
      if(quoted&&csv[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
    }else if(char===","&&!quoted){row.push(cell);cell="";}
    else if((char==="\n"||char==="\r")&&!quoted){
      if(char==="\r"&&csv[i+1]==="\n")i++;
      row.push(cell);if(row.some(value=>value.trim()))rows.push(row);row=[];cell="";
    }else cell+=char;
  }
  row.push(cell);if(row.some(value=>value.trim()))rows.push(row);
  return rows;
}

export function summarizeResults(results:LiveResult[]):LiveSummary{
  const active=results.filter(row=>row.status==="on_course");
  const timed=active.filter(row=>row.averageLapSeconds!==null);
  const averageLapSeconds=timed.length?Math.round(timed.reduce((sum,row)=>sum+(row.averageLapSeconds??0),0)/timed.length):null;
  return {
    currentYard:Math.max(0,...active.map(row=>row.currentYard)),
    stillIn:active.length,
    teamDistanceKm:results.reduce((sum,row)=>sum+row.yardsCompleted*6.7056,0),
    averageLapSeconds,
    averageRestSeconds:averageLapSeconds===null?null:3600-averageLapSeconds,
  };
}

export function parseLiveFeedCsv(csv:string):{results:LiveResult[];summary:LiveSummary;comments:string[]}{
  const rows=parseCsvRows(csv);
  const headerIndex=rows.findIndex(row=>row.some(cell=>normalize(cell)==="bib")&&row.some(cell=>normalize(cell)==="athlete"));
  if(headerIndex<0) throw new Error("Live Results header row not found");
  const headers=rows[headerIndex].map(normalize);
  const column=(name:string)=>headers.indexOf(normalize(name));
  const get=(row:string[],name:string)=>{const index=column(name);return index>=0?(row[index]??"").trim():""};
  const sourceRows=rows.slice(headerIndex+1).filter(row=>Number(get(row,"Bib"))>0&&Boolean(get(row,"Athlete")));
  const results=sourceRows.map((row,index)=>{
    const rawStatus=get(row,"Status");
    const currentYard=Number(get(row,"Current Yard"))||0;
    // Status is the race director's source of truth. Current Yard is timing data,
    // so it must never silently turn an explicitly active runner into an exit.
    const canonicalStatus:RunnerStatus=rawStatus?normalizeStatus(rawStatus):(currentYard>0?"on_course":"out");
    return {
    athleteId:get(row,"Athlete ID")||`SGP-${String(index+1).padStart(3,"0")}`,
    bib:Number(get(row,"Bib"))||index+1,
    name:get(row,"Athlete"),
    status:canonicalStatus,
    statusLabel:rawStatus.trim().toUpperCase()||({on_course:"ON COURSE",out:"OUT"} as const)[canonicalStatus],
    yardsCompleted:Number(get(row,"Yards Completed"))||0,
    currentYard,
    lastLapSeconds:parseDuration(get(row,"Last Lap")),
    averageLapSeconds:parseDuration(get(row,"Average Lap")),
    progress:Math.max(0,Math.min(100,Number(get(row,"Course Progress %").replace("%",""))*(get(row,"Course Progress %").includes("%")?1:100)||0)),
    updatedAt:get(row,"Updated At")||new Date().toISOString(),
    note:get(row,"Note"),
    laps:[],
  }});
  const fallback=summarizeResults(results);
  const inlineSummaryRow=sourceRows.find(row=>get(row,"Current Field Yard")||get(row,"Still In")||get(row,"Team Distance (km)"))??[];
  const blockHeaderIndex=rows.findIndex((row,index)=>index>headerIndex&&row.some(cell=>normalize(cell)==="currentfieldyard")&&row.some(cell=>normalize(cell)==="stillin"));
  const blockHeaders=blockHeaderIndex>=0?rows[blockHeaderIndex].map(normalize):[];
  const blockValues=blockHeaderIndex>=0?(rows[blockHeaderIndex+1]??[]):[];
  const blockGet=(name:string)=>{const index=blockHeaders.indexOf(normalize(name));return index>=0?(blockValues[index]??"").trim():""};
  const summaryValue=(name:string)=>blockGet(name)||get(inlineSummaryRow,name);
  const averageLapSeconds=parseDuration(summaryValue("Field Average Lap"));
  const averageRestSeconds=parseDuration(summaryValue("Field Average Rest"));
  const commentHeaderIndex=rows.findIndex((row,index)=>index>headerIndex&&row.some(cell=>normalize(cell)==="overheardontheyard"));
  const commentColumn=commentHeaderIndex>=0?rows[commentHeaderIndex].findIndex(cell=>normalize(cell)==="overheardontheyard"):-1;
  const comments=commentHeaderIndex>=0&&commentColumn>=0?rows.slice(commentHeaderIndex+1).map(row=>(row[commentColumn]??"").trim()).filter(Boolean):[];
  return {results,comments,summary:{
    currentYard:Number(summaryValue("Current Field Yard"))||fallback.currentYard,
    stillIn:Number(summaryValue("Still In"))||fallback.stillIn,
    teamDistanceKm:Number(summaryValue("Team Distance (km)"))||fallback.teamDistanceKm,
    averageLapSeconds:averageLapSeconds??fallback.averageLapSeconds,
    averageRestSeconds:averageRestSeconds??fallback.averageRestSeconds,
  }};
}

export function parseLapLogCsv(csv:string):Record<number,LapSplit[]>{
  const rows=parseCsvRows(csv);
  const headerIndex=rows.findIndex(row=>row.some(cell=>normalize(cell)==="bib")&&row.some(cell=>/^yard\d+$/.test(normalize(cell))));
  if(headerIndex<0) throw new Error("Lap Log header row not found");
  const headers=rows[headerIndex].map(normalize);
  const bibColumn=headers.indexOf("bib");
  const yardColumns=headers.map((header,index)=>{
    const match=header.match(/^yard(\d+)$/);
    return match?{index,yard:Number(match[1])}:null;
  }).filter((value):value is {index:number;yard:number}=>Boolean(value));
  const lapsByBib:Record<number,LapSplit[]>={};
  for(const row of rows.slice(headerIndex+1)){
    const bib=Number(row[bibColumn]);
    if(!bib) continue;
    lapsByBib[bib]=yardColumns.flatMap(({index,yard})=>{
      const seconds=parseDuration((row[index]??"").trim());
      return seconds&&seconds>0?[{yard,seconds}]:[];
    });
  }
  return lapsByBib;
}

export function attachLapHistory(results:LiveResult[],lapsByBib:Record<number,LapSplit[]>):LiveResult[]{
  return results.map(result=>({...result,laps:lapsByBib[result.bib]??[]}));
}

export function parseLiveResultsCsv(csv:string):LiveResult[]{return parseLiveFeedCsv(csv).results;}
