import { toSourceLiteral } from './utils.js';
import type { ParamDef, Language } from './types.js';

/**
 * Generates a JSDoc comment block from a list of ParamDef objects and a return type.
 *
 * Language differences:
 * - TypeScript: `@param name - description` (no type — already in signature)
 * - JavaScript: `@param {type} name - description` (full JSDoc types for tooling)
 * - TypeScript: `@returns description`
 * - JavaScript: `@returns {type} description`
 *
 * @param paramDefs         - Array of parameter definitions
 * @param returnType        - TypeScript return type string
 * @param language          - Target language ('ts' or 'js'). Defaults to 'ts'
 * @param returnDescription - Description for the @returns tag. Defaults to a placeholder.
 * @returns Formatted JSDoc block string (including surrounding `/** ... *\/`)
 */
export function toJSDOC(
  paramDefs: ParamDef[],
  returnType: string,
  language: Language = 'ts',
  returnDescription = 'Expected return type for this scaffold',
  name?: string,
  examples?: Array<{ args: unknown[]; output: unknown }>,
): string {
  const lines: string[] = ['/**', ' * TODO: Describe the function purpose.'];

  for (const p of paramDefs) {
    const desc = p.description ?? p.name;
    if (language === 'js') {
      lines.push(` * @param {${p.tsType}} ${p.name} - ${desc}`);
    } else {
      lines.push(` * @param ${p.name} - ${desc}`);
    }
  }

  if (language === 'js') {
    lines.push(` * @returns {${returnType}} ${returnDescription}`);
  } else {
    lines.push(` * @returns ${returnDescription}`);
  }

  if (name && examples && examples.length > 0) {
    for (const ex of examples) {
      const argsStr = ex.args.map(toSourceLiteral).join(', ');
      const outStr = toSourceLiteral(ex.output);
      lines.push(` * @example ${name}(${argsStr}) // => ${outStr}`);
    }
  }

  lines.push(' */');
  return lines.join('\n');
}
