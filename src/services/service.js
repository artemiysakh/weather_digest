import {getCoordinatesCity, getForecast} from '../api/api.js';
import {readReport, writeReport} from '../storage/storage.js';

async function processCity(city, days, noCache) {
  if (!noCache) {
    const cached = await readReport(city);
    if (cached) {
      return { city, fromCache: true, data: cached };
    }
  }

  const coords = await getCoordinatesCity(city);
  const daily = await getForecast(coords, days);

  const report = {
    city: coords.name,
    country: coords.country,
    coordinates: { latitude: coords.latitude, longitude: coords.longitude },
    days,
    temperatureUnit: daily.temperature_2m_max ? undefined : undefined,
    generatedAt: new Date().toISOString(),
    forecast: daily.time.map((date, i) => ({
      date,
      tMin: daily.temperature_2m_min[i],
      tMax: daily.temperature_2m_max[i],
      precipitation: daily.precipitation_sum[i],
    })),
  };

  const savedPath = await writeReport(city, report);

  return { city, fromCache: false, data: report, savedPath };
}

export async function buildDigest(cities, days, noCache) {
  const tasks = cities.map((city) =>
    processCity(city, days, noCache)
      .then((result) => ({ status: 'ok', ...result }))
      .catch((err) => ({ status: 'error', city, error: err.message }))
  );
  return Promise.all(tasks);
}