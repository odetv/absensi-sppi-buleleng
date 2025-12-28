import { TypeLocation, getLocations } from "@/lib/datasources/listLocation";

export function HaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function MatchingLocation(
  lat: number,
  lon: number
): Promise<TypeLocation | null> {
  const locations = await getLocations();
  let closest: TypeLocation | null = null;
  let minDistance = Infinity;
  for (const location of locations) {
    const distance = HaversineDistance(lat, lon, location.lat, location.lon);
    if (distance <= location.radius && distance < minDistance) {
      minDistance = distance;
      closest = location;
    }
  }
  return closest;
}
