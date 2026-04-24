import { toSourceLiteral } from './utils.js';
import { toJSParams } from './params.js';
import { toJSDOC } from './jsdoc.js';
import { testTemplateGenerator } from './test-template.js';
import type { ScaffoldFunctionConfig, ScaffoldFunctionResult } from './types.js';

/**
 * Scaffolds a complete function with JSDoc and a companion test file.
 *
 * The generated function body contains TODO comments and a placeholder
 * return value derived from `exampleOutput`, so the wiring test passes
 * immediately.  A human or LLM then fills in the actual business logic.
 *
 * @param config - Scaffold configuration (name, params, types, examples, language)
 * @returns `{ fileName, testFileName, source, testSource }` for the scaffold
 * @throws {Error} If `name` is not a valid JavaScript identifier
 */
export function scaffoldFunction(config: ScaffoldFunctionConfig): ScaffoldFunctionResult {
  const { name, paramDefs, outputType, returnDescription, exampleOutput, language } = config;

  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    throw new Error(`scaffoldFunction: '${name}' is not a valid JavaScript identifier`);
  }

  const fileName = `${name}.${language}`;
  const testFileName = `${name}.test.${language}`;

  const jsdoc = toJSDOC(paramDefs, outputType, language, returnDescription);
  const params = toJSParams(paramDefs, language);
  const returnTypeSuffix = language === 'ts' ? `: ${outputType}` : '';
  const returnValue = toSourceLiteral(exampleOutput);
  const inputComment = toSourceLiteral(Object.fromEntries(paramDefs.map((p) => [p.name, p.example])));
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

  const testSource = testTemplateGenerator(name, paramDefs, exampleOutput, language);

  return { fileName, testFileName, source, testSource };
}
