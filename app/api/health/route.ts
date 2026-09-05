export const dynamic="force-dynamic";

export async function GET(){
  return Response.json(
    {status:"ok",service:"backyard-ultra-singapore-live"},
    {headers:{"cache-control":"no-store"}},
  );
}
