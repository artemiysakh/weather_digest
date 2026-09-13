const GEO_API = process.env.GEO_API_URL ?? 'https://geocoding-api.open-meteo.com/v1/search';
const METEO_API = process.env.METEO_API_URL ?? 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS ?? 5000);
const TEMPERATURE_UNIT = process.env.TEMPERATURE_UNIT ?? 'celsius';

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} при запросе ${url}`);
    }

    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`Некорректный JSON в ответе — ${url}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Таймаут запроса: ${url}`);
    }
    const code = err.code ?? err.cause?.code;
    if (code === 'ENOTFOUND') {
      throw new Error(`Нет соединения с сетью — ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCoordinatesCity(city) {
  const url =
    `${GEO_API}?name=${encodeURIComponent(city)}` +
    `&count=1&language=ru`;

  const res = await fetchJson(url);

  if (!res.results || res.results.length === 0) {
    throw new Error(`Город "${city}" не найден`);
  }

  const { latitude, longitude, name, country } = res.results[0];
  return { latitude, longitude, name, country };
}

export async function getForecast({ latitude, longitude }, days) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: days,
    timezone: 'auto',
    temperature_unit: TEMPERATURE_UNIT,
  });

  const data = await fetchJson(`${METEO_API}?${params}`);
  return data.daily;
}