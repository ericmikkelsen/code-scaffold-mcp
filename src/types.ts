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
  fileName: string;
  testFileName: string;
  source: string;
  testSource: string;
};
