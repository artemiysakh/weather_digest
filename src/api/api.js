const GEO_API = process.env.GEO_API_URL
const METEO_API = process.env.METEO_API_URL
const timeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 5000)
const temperatureUnit = process.env.TEMPERATURE_UNIT

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try{
    const res = await fetch(url, {signal: controller.signal});
    if(!res.ok){
      throw new Error(`HTTP ${res.status} при запросе ${url}`);
    }
    return await res.json();
  }catch(err){
    if (err.name === 'AbortError') {
      throw new Error(`Таймаут запроса: ${url}`);
    }
    throw err;
  }finally{
    clearTimeout(timer);
  }
}
export async function getCoordinatesCity(city){
        const url=GEO_API+`?name=${encodeURIComponent(city)}&count=1&language=ru`
        const res = await fetchJson(url) 
        if (!res.results || res.results.length === 0) {
            throw new Error(`Город "${city}" не найден`);
        }
        const { latitude, longitude, name, country } = res.results[0];
        return { latitude, longitude, name, country };
}     
export async function getForecast({latitude, longitude}, days){
    const params = new URLSearchParams({
      latitude,
      longitude,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      forecast_days: days,
      timezone: 'auto',
      temperature_unit: temperatureUnit,
  });
  const url=process.env.METEO_API_URL+`?${params}`
  const data = await fetchJson(url);
  return data.daily;
}