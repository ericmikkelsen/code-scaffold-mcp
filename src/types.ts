/**
 * A single parameter definition used as the source of truth for generating
 * function signatures, JSDoc, and test fixtures.
 */
export type ParamDef = {
  name: string;
  /** TypeScript type string, e.g. 'string', 'number', '{id: string}' */
  tsType: string;
  /** Concrete JS value used as a test fixture and example comment */
  example: unknown;
  description?: string;
};

/** Output language for the scaffold */
export type Language = 'ts' | 'js';

/** Configuration for scaffoldFunction() */
export type ScaffoldFunctionConfig = {
  name: string;
  paramDefs: ParamDef[];
  outputType: string;
  exampleInput: Record<string, unknown>;
  exampleOutput: unknown;
  language: Language;
};

/** Return value from scaffoldFunction() */
export type ScaffoldFunctionResult = {
  fileName: string;
  testFileName: string;
  source: string;
  testSource: string;
};
