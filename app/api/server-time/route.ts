export async function GET() {
  const nowUTC = new Date();
  const timeInWITA = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000); // UTC+8
  return Response.json({
    iso: timeInWITA.toISOString(),
    millis: timeInWITA.getTime(),
  });
}
