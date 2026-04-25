function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function serializeSourceLiteral(value: unknown, seen: Set<object>): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }

  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'number':
      if (!Number.isFinite(value)) {
        throw new TypeError('toSourceLiteral only supports finite numbers.');
      }
      return String(value);
    case 'boolean':
      return String(value);
    case 'object':
      break;
    default:
      throw new TypeError(
        `toSourceLiteral only supports JSON-like values; received ${typeof value}.`,
      );
  }

  if (seen.has(value as object)) {
    throw new TypeError('toSourceLiteral does not support circular references.');
  }

  seen.add(value as object);
  try {
    if (Array.isArray(value)) {
      return `[${value.map((item) => serializeSourceLiteral(item, seen)).join(', ')}]`;
    }

    if (!isPlainObject(value)) {
      throw new TypeError(
        'toSourceLiteral only supports plain objects, arrays, and primitive JSON-like values.',
      );
    }

    const entries = Object.entries(value).map(
      ([key, entryValue]) => `${JSON.stringify(key)}: ${serializeSourceLiteral(entryValue, seen)}`,
    );
    return entries.length === 0 ? '{}' : `{ ${entries.join(', ')} }`;
  } finally {
    seen.delete(value as object);
  }
}

/**
 * Serializes a value to a compact JS source-code literal.
 *
 * Supports `null`, `undefined`, booleans, finite numbers, strings, arrays,
 * and plain objects. Throws a `TypeError` for non-finite numbers, circular
 * references, non-plain objects (e.g. `Map`, `Set`, `Date`), and
 * non-JSON-like types (e.g. functions, symbols, bigints).
 */
export function toSourceLiteral(value: unknown): string {
  return serializeSourceLiteral(value, new Set<object>());
}
