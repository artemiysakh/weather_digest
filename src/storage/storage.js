import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';


const reportsDir = process.env.REPORTS_DIR

function todayISO(){
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function safeFileName(city) {
  return city.replace(/[\\/:*?"<>|]/g, '_').trim();
}

export function reportPath(city) {
  return join(reportsDir, `${safeFileName(city)}-${todayISO()}.json`);
}

export async function readReport(city) {
  try {
    const raw = await readFile(reportPath(city), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function writeReport(city, payload) {
  await mkdir(reportsDir, { recursive: true });
  const path = reportPath(city);
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf8');
  return path;
}