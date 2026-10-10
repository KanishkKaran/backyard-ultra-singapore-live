import {attachLapHistory,parseLapLogCsv,parseLiveFeedCsv,sampleResults,summarizeResults} from "../../../lib/live-results";

export const dynamic="force-dynamic";
const publishedBase="https://docs.google.com/spreadsheets/d/e/2PACX-1vRNjIHPMc6H6dUZTJZfH9jyiJwEN21rA36asUo6CFjahZSnZlWUbhKCE7PQZwo-AlftLxwpxFF1zajr/pub?output=csv";
const publishedSheet=`${publishedBase}&gid=1965817687`;
const publishedLapLog=`${publishedBase}&gid=401211972`;

async function fetchCsv(url:string){
  const freshUrl=new URL(url);freshUrl.searchParams.set("_",Date.now().toString());
  const response=await fetch(freshUrl,{cache:"no-store",headers:{accept:"text/csv","cache-control":"no-cache"}});
  if(!response.ok)throw new Error(`Spreadsheet returned ${response.status}`);
  return response.text();
}

export async function GET(){
  const sheetUrl=process.env.SHEET_CSV_URL||publishedSheet;
  const lapLogUrl=process.env.LAP_LOG_CSV_URL||publishedLapLog;
  if(sheetUrl){
    try{
      const [resultsCsv,lapLogCsv]=await Promise.all([fetchCsv(sheetUrl),fetchCsv(lapLogUrl).catch(()=>"")]);
      const feed=parseLiveFeedCsv(resultsCsv);
      if(lapLogCsv){
        feed.results=attachLapHistory(feed.results,parseLapLogCsv(lapLogCsv));
        feed.summary=summarizeResults(feed.results);
      }
      if(feed.results.length) return Response.json({source:"spreadsheet",...feed,polledAt:new Date().toISOString()},{headers:{"cache-control":"no-store, max-age=0","x-data-source":"spreadsheet"}});
    }catch(error){console.error("Spreadsheet feed unavailable",error);}
  }
  return Response.json({source:"test",results:sampleResults,summary:summarizeResults(sampleResults),comments:["Joshua feels he can go strong.","Kanishk had a fast lap."],polledAt:new Date().toISOString()},{headers:{"cache-control":"no-store"}});
}
