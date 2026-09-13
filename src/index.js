import 'dotenv/config';
import { Command } from 'commander';
import { buildDigest } from './services/service.js';
import { printResults, printSummary } from './format/output.js';

const program = new Command();

program
  .name('weather-digest')
  .description('Погодный дайджест по городам (Open-Meteo)')
  .requiredOption('-c, --city <cities>', 'Города через запятую, например: "Москва,Казань"')
  .option('-d, --days <number>', 'Количество дней (1–7)', '3')
  .option('--no-cache', 'Игнорировать кэш и запросить данные заново')
  .action(async (opts) => {
    const cities = opts.city
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (cities.length === 0) {
      throw new Error('--city не может быть пустым');
    }

    const days = Number(opts.days);
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      throw new Error('--days должно быть целым числом от 1 до 7');
    }

    const results = await buildDigest(cities, days, opts.cache === false);

    printResults(results);
    printSummary(results);

    const hasErrors = results.some((r) => r.status === 'error');
    process.exitCode = hasErrors ? 1 : 0;
  });

program.parseAsync().catch((err) => {
  console.error(`\nОшибка: ${err.message}`);
  process.exit(1);
});