import { tempToCondition, type WeatherCondition } from "./types";

export type WeatherInfo = {
  tempC: number;
  condition: WeatherCondition;
  precipitation: number;
  code: number;
  summary: string;
};

const WEATHER_TEXT: Record<number, string> = {
  0: "Klar",
  1: "Überwiegend klar",
  2: "Teils bewölkt",
  3: "Bewölkt",
  45: "Nebel",
  48: "Reifnebel",
  51: "Leichter Nieselregen",
  53: "Nieselregen",
  55: "Starker Nieselregen",
  61: "Leichter Regen",
  63: "Regen",
  65: "Starker Regen",
  71: "Leichter Schneefall",
  73: "Schneefall",
  75: "Starker Schneefall",
  80: "Regenschauer",
  81: "Starke Regenschauer",
  82: "Heftige Regenschauer",
  95: "Gewitter",
  96: "Gewitter mit Hagel",
  99: "Schweres Gewitter",
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Wetter konnte nicht geladen werden.");
  const json = await res.json();
  const tempC = json.current.temperature_2m;
  const precipitation = json.current.precipitation;
  const code = json.current.weather_code;
  return {
    tempC,
    precipitation,
    code,
    condition: tempToCondition(tempC),
    summary: WEATHER_TEXT[code] ?? "Wetter",
  };
}

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation wird vom Browser nicht unterstützt."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
    });
  });
}
