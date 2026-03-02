import { Decimal } from '@prisma/client/runtime/library';

/**
 * Formats a decimal value to a fixed-precision string with 2 decimal places.
 * Used to standardize monetary field serialization across the API.
 *
 * @param value - A Prisma Decimal, number, string, or object with toString() method
 * @returns A string formatted to 2 decimal places (e.g., "500.00")
 */
export function formatDecimal(
  value: Decimal | number | string | { toString(): string },
): string {
  return Number(value).toFixed(2);
}
