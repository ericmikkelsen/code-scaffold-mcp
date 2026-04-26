/**
 * Splits a string at top-level occurrences of a single separator character,
 * ignoring occurrences that are nested inside angle brackets, square brackets,
 * round brackets, or curly braces.
 *
 * @param str - The string to split
 * @param sep - A single separator character
 * @returns Array of substrings between top-level separators (including trailing empty strings)
 */
function splitAtTopLevelChar(str: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<' || ch === '[' || ch === '(' || ch === '{') {
      depth++;
      current += ch;
    } else if (ch === '>' || ch === ']' || ch === ')' || ch === '}') {
      depth--;
      current += ch;
    } else if (ch === sep && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

/**
 * Tries to parse a TypeScript arrow function type of the form `(params) => returnType`.
 * Returns `null` if the string does not match that shape.
 */
function matchArrowFunctionType(type: string): { params: string; returnType: string } | null {
  if (!type.startsWith('(')) return null;

  // Find the closing ) that matches the opening (
  let depth = 0;
  let closeIdx = -1;
  for (let i = 0; i < type.length; i++) {
    if (type[i] === '(') depth++;
    else if (type[i] === ')') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }

  if (closeIdx === -1) return null;

  const afterParen = type.slice(closeIdx + 1).trimStart();
  if (!afterParen.startsWith('=>')) return null;

  return {
    params: type.slice(1, closeIdx),
    returnType: afterParen.slice(2).trim(),
  };
}

/**
 * Extracts and converts the type portion from a TypeScript named-parameter declaration.
 * For `name: type`, returns `tsTypeToJSDoc(type)`.
 * For a bare type string (no colon), returns `tsTypeToJSDoc(str)`.
 */
function extractTypeFromParam(param: string): string {
  const colonIdx = param.indexOf(':');
  if (colonIdx < 0) return tsTypeToJSDoc(param.trim());
  // Only treat it as `name: type` if the left side looks like a simple identifier
  const left = param.slice(0, colonIdx).trim();
  if (/^\.{0,3}[a-zA-Z_$][a-zA-Z0-9_$]*\??$/.test(left)) {
    return tsTypeToJSDoc(param.slice(colonIdx + 1).trim());
  }
  return tsTypeToJSDoc(param.trim());
}

/**
 * Converts a TypeScript type string into a JSDoc-compatible type string for use
 * in `@param {type}` and `@returns {type}` tags.
 *
 * Conversions applied:
 * - **Union types** `A | B` → `(A|B)` — JSDoc union syntax
 * - **Arrow function types** `(x: T) => R` → `function(T): R` — JSDoc function syntax
 * - **Tuple types** `[T1, T2]` → `Array` — no direct JSDoc equivalent
 * - **Mapped types** `{ [K in keyof T]: V }` → `Object`
 * - **Conditional types** `T extends U ? A : B` → `*`
 * - Everything else (primitives, generics, object literals, array shorthand) is passed through
 *   unchanged — modern TypeScript-aware JSDoc tooling (VS Code, TypeDoc) accepts these directly.
 *
 * @param tsType - A TypeScript type string
 * @returns A JSDoc-compatible type string
 */
export function tsTypeToJSDoc(tsType: string): string {
  const type = tsType.trim();

  // Union types: split on | at top level
  const unionParts = splitAtTopLevelChar(type, '|').map((p) => p.trim()).filter(Boolean);
  if (unionParts.length > 1) {
    return '(' + unionParts.map(tsTypeToJSDoc).join('|') + ')';
  }

  // Arrow function type: (params) => returnType
  const arrowMatch = matchArrowFunctionType(type);
  if (arrowMatch) {
    const paramTypes = arrowMatch.params
      ? splitAtTopLevelChar(arrowMatch.params, ',')
          .map((p) => p.trim())
          .filter(Boolean)
          .map(extractTypeFromParam)
      : [];
    return `function(${paramTypes.join(', ')}): ${tsTypeToJSDoc(arrowMatch.returnType)}`;
  }

  // Tuple type: [T1, T2, ...] — identified by starting with [
  // (array shorthand like `string[]` starts with the type name, not `[`)
  if (type.startsWith('[') && type.endsWith(']')) {
    return 'Array';
  }

  // Conditional type: T extends U ? A : B
  // Detected by a top-level `?` with ` extends ` in the preceding part
  const conditionalParts = splitAtTopLevelChar(type, '?');
  if (conditionalParts.length > 1 && conditionalParts[0].includes(' extends ')) {
    return '*';
  }

  // Mapped type: { [K in keyof T]: V } or { [K in T]: V }
  if (type.startsWith('{') && type.endsWith('}')) {
    const inner = type.slice(1, -1).trim();
    if (inner.includes(' in ') || inner.includes('keyof')) {
      return 'Object';
    }
  }

  // Everything else: pass through unchanged
  return type;
}
