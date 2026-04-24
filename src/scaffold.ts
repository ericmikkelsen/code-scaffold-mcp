import { inspect } from 'node:util';
import { toJSParams } from './params.js';
import { toJSDOC } from './jsdoc.js';
import { testTemplateGenerator } from './test-template.js';
import type { ScaffoldFunctionConfig, ScaffoldFunctionResult } from './types.js';

/** Serializes a value to a compact JS source-code literal. */
function toSourceLiteral(value: unknown): string {
  return inspect(value, { depth: 10, compact: true });
}

/**
 * Scaffolds a complete function with JSDoc and a companion test file.
 *
 * The generated function body contains TODO comments and a placeholder
 * return value derived from `exampleOutput`, so the wiring test passes
 * immediately.  A human or LLM then fills in the actual business logic.
 *
 * @param config - Scaffold configuration (name, params, types, examples, language)
 * @returns `{ fileName, testFileName, source, testSource }` for the scaffold
 */
export function scaffoldFunction(config: ScaffoldFunctionConfig): ScaffoldFunctionResult {
  const { name, paramDefs, outputType, exampleInput, exampleOutput, language } = config;

  const ext = language;
  const fileName = `${name}.${ext}`;
  const testFileName = `${name}.test.${ext}`;

  const jsdoc = toJSDOC(paramDefs, outputType, language);
  const params = toJSParams(paramDefs, language);
  const returnTypeSuffix = language === 'ts' ? `: ${outputType}` : '';
  const returnValue = toSourceLiteral(exampleOutput);
  const inputComment = toSourceLiteral(exampleInput);
  const outputComment = toSourceLiteral(exampleOutput);

  const source = [
    jsdoc,
    `export function ${name}(${params})${returnTypeSuffix} {`,
    `  // TODO: implement business logic`,
    `  // Example input from scaffold config: ${inputComment}`,
    `  // Example output from scaffold config: ${outputComment}`,
    ``,
    `  return ${returnValue};`,
    `}`,
    ``,
  ].join('\n');

  const testSource = testTemplateGenerator(
    name,
    paramDefs,
    { input: exampleInput, output: exampleOutput },
    language,
  );

  return { fileName, testFileName, source, testSource };
}
