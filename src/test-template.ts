import { toSourceLiteral } from './utils.js';
import type { ParamDef, Language } from './types.js';

/**
 * Generates a node:test file template for a scaffolded function.
 *
 * The first test wires the happy-path example so the test suite passes
 * immediately after scaffolding.  The second test is a placeholder for
 * edge-case coverage that must be filled in before the function is
 * considered submission-ready.
 *
 * @param funcName      - Name of the function being tested
 * @param paramDefs     - Parameter definitions (used to build the call expression)
 * @param exampleOutput - Expected output value for the wiring test assertion
 * @param language      - Target language ('ts' or 'js'). Defaults to 'ts'
 * @returns Complete test file source as a string
 */
export function testTemplateGenerator(
  funcName: string,
  paramDefs: ParamDef[],
  exampleOutput: unknown,
  language: Language = 'ts',
  returnPlaceholder?: string,
): string {
  const moduleExt = '.js';
  const callArgs = paramDefs.map((p) => toSourceLiteral(p.example)).join(', ');
  const expectedOutput = toSourceLiteral(exampleOutput);
  const wiringAssertion = returnPlaceholder
    ? [
        `  const result = ${funcName}(${callArgs});`,
        `  assert.strictEqual(typeof result, 'function', '${funcName} should return a function');`,
      ]
    : [
        `  assert.deepEqual(${funcName}(${callArgs}), ${expectedOutput});`,
      ];

  return [
    `import test from 'node:test';`,
    `import assert from 'node:assert/strict';`,
    `import { ${funcName} } from './${funcName}${moduleExt}';`,
    ``,
    `test('TODO: replace with real behavior tests', () => {`,
    `  // This starter test confirms wiring only.`,
    ...wiringAssertion,
    `});`,
    ``,
    `test('TODO: add edge cases after implementation', () => {`,
    `  // Example: invalid ${paramDefs[0]?.name ?? 'input'} cases should be asserted here.`,
    `  assert.ok(true);`,
    `});`,
    ``,
  ].join('\n');
}
