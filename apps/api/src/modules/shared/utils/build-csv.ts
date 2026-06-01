import { stringify } from 'csv-stringify/sync';

export function buildCsv(headers: string[], rows: string[][]): string {
  const csv = stringify([headers, ...rows]);
  return `﻿${csv}`;
}
