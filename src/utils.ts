import { inspect } from 'node:util';

/** Serializes a value to a compact JS source-code literal. */
export function toSourceLiteral(value: unknown): string {
  return inspect(value, { depth: 10, compact: true });
}
