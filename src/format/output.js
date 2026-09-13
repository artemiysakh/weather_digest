function padRight(s, n) {
  return String(s).padEnd(n);
}

function padLeft(s, n) {
  return String(s).padStart(n);
}

export function printResults(results) {
  for (const r of results) {
    if (r.status === 'error') {
      console.error(`\n✗ ${r.city}: ${r.error}`);
      continue;
    }

    const { city, country, coordinates, forecast } = r.data;
    const tag = r.fromCache ? ' (из кэша)' : '';

    console.log(`\n=== ${city}, ${country}${tag} ===`);
    console.log(`Координаты: ${coordinates.latitude}, ${coordinates.longitude}`);

    if (r.savedPath) {
      console.log(`Отчёт: ${r.savedPath}`);
    }

    console.log('');
    console.log('Дата        | Мин   | Макс  | Осадки, мм');
    console.log('------------|-------|-------|------------');

    for (const day of forecast) {
      console.log(
        `${padRight(day.date, 11)} | ` +
        `${padLeft(day.tMin, 5)} | ` +
        `${padLeft(day.tMax, 5)} | ` +
        `${padLeft(day.precipitation, 10)}`
      );
    }
  }
}

export function printSummary(results) {
  const ok = results.filter((r) => r.status === 'ok').length;
  const failed = results.filter((r) => r.status === 'error').length;
  const cached = results.filter((r) => r.status === 'ok' && r.fromCache).length;

  console.log('');
  console.log(
    `Итого: успешно ${ok} (из кэша ${cached}), с ошибкой ${failed}`
  );
}