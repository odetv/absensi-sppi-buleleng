const radiusInMeters = 5000;

export type TypeSPPGLocation = {
  name: string;
  lat: number;
  lon: number;
  radius: number;
};

export const SPPG_LOCATIONS = [
  {
    name: "SPPG Buleleng Banjar Dencarik",
    lat: -8.1864444,
    lon: 114.9765556,
    radius: radiusInMeters,
  },
  {
    name: "SPPG Buleleng Sukasada Pancasari",
    lat: -8.1543611,
    lon: 115.1081944,
    radius: radiusInMeters,
  },
];
