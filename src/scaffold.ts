import { toSourceLiteral, extractTypeParams } from './utils.js';
import { toJSParams } from './params.js';
import { toJSDOC } from './jsdoc.js';
import { testTemplateGenerator } from './test-template.js';
import type { ScaffoldFunctionConfig, ScaffoldFunctionResult } from './types.js';

const JS_RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void',
  'while', 'with', 'yield',
  'enum', 'implements', 'interface', 'package', 'private', 'protected', 'public',
]);

function assertValidIdentifier(value: string, label: string): void {
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
    throw new Error(`scaffoldFunction: ${label} '${value}' is not a valid JavaScript identifier`);
  }
  if (JS_RESERVED_WORDS.has(value)) {
    throw new Error(`scaffoldFunction: ${label} '${value}' is a reserved JavaScript keyword`);
  }
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
 * @throws {Error} If `name` or any param name is not a valid JavaScript identifier or is a reserved keyword
 */
export function scaffoldFunction(config: ScaffoldFunctionConfig): ScaffoldFunctionResult {
  const {
    name,
    description,
    paramDefs,
    outputType,
    returnDescription,
    exampleOutput,
    returnPlaceholder,
    examples,
    typeParams,
    language,
  } = config;

  assertValidIdentifier(name, 'name');
  for (const p of paramDefs) {
    assertValidIdentifier(p.name, 'param name');
  }

  const fileName = `${name}.${language}`;
  const testFileName = `${name}.test.${language}`;

  const allExamples = [
    { args: paramDefs.map((p) => p.example), output: exampleOutput },
    ...(examples ?? []),
  ];

  const jsdoc = toJSDOC(paramDefs, outputType, language, returnDescription, name, allExamples, description);
  const params = toJSParams(paramDefs, language);
  const returnTypeSuffix = language === 'ts' ? `: ${outputType}` : '';
  const returnValue = returnPlaceholder ?? toSourceLiteral(exampleOutput);

  // Compute generic type param clause for TS mode (e.g. `<T>` or `<K, V>`).
  // When `typeParams` is explicitly provided it is used verbatim (even if empty,
  // which suppresses auto-detection). When omitted, type params are auto-detected
  // from the param types and output type.
  let typeParamClause = '';
  if (language === 'ts') {
    const effectiveTypeParams: string[] =
      typeParams !== undefined
        ? typeParams
        : extractTypeParams([...paramDefs.map((p) => p.tsType), outputType]);
    if (effectiveTypeParams.length > 0) {
      typeParamClause = `<${effectiveTypeParams.join(', ')}>`;
    }
  }

  const source = [
    jsdoc,
    `export function ${name}${typeParamClause}(${params})${returnTypeSuffix} {`,
    `  return ${returnValue};`,
    `}`,
    ``,
  ].join('\n');

  const testSource = testTemplateGenerator(name, paramDefs, exampleOutput, language, returnPlaceholder);

  return { fileName, testFileName, source, testSource };
}
