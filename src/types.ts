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
  /** Optional description used in the generated JSDoc @param line; falls back to the param name */
  description?: string;
};

/** Output language for the scaffold */
export type Language = 'ts' | 'js';

/** Configuration for scaffoldFunction() */
export type ScaffoldFunctionConfig = {
  /** Valid JavaScript identifier for the generated function name */
  name: string;
  paramDefs: ParamDef[];
  /** TypeScript return type string, e.g. 'string', 'boolean', 'User' */
  outputType: string;
  /** Optional description for the @returns JSDoc tag. Defaults to a placeholder. */
  returnDescription?: string;
  /** Concrete JS value used as the placeholder return and in the wiring test assertion */
  exampleOutput: unknown;
  /** Output language for the generated source and test files */
  language: Language;
};

/** Return value from scaffoldFunction() */
export type ScaffoldFunctionResult = {
  /** File name for the generated source file, e.g. 'myFunc.ts' or 'myFunc.js' */
  fileName: string;
  /** File name for the generated test file, e.g. 'myFunc.test.ts' or 'myFunc.test.js' */
  testFileName: string;
  /** Complete source of the generated function file */
  source: string;
  /** Complete source of the generated test file */
  testSource: string;
};
