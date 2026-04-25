import type { ParamDef, Language } from './types.js';

/**
 * Converts an array of ParamDef objects into a function parameter string.
 *
 * - For TypeScript: includes inline type annotations (`email: string, count: number`)
 * - For JavaScript: parameter names only              (`email, count`)
 *
 * @param paramDefs - Array of parameter definitions
 * @param language  - Target language ('ts' or 'js'). Defaults to 'ts'
 * @returns Comma-separated parameter string for use in a function signature
 */
export function toJSParams(paramDefs: ParamDef[], language: Language = 'ts'): string {
  return paramDefs
    .map((p) => (language === 'ts' ? `${p.name}: ${p.tsType}` : p.name))
    .join(', ');
}
