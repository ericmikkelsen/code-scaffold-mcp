# code-scaffold-mcp

A scaffold-first system for generating function templates that reduce LLM token waste and improve delivery speed. It standardizes generation through TypeScript-first inputs, dual output modes (`ts` and `js`).

## Overview

Code MCP pre-scaffolds function skeletons with types, JSDoc, and node:test templates already wired, so LLMs focus on business logic instead of boilerplate.

## Installation

```bash
npm install code-scaffold-mcp
```

## Usage

```typescript
import { scaffoldFunction } from 'code-scaffold-mcp';

const result = scaffoldFunction({
  name: 'validateEmail',
  paramDefs: [
    { name: 'email', tsType: 'string', example: 'dev@example.com', description: 'Email to validate' }
  ],
  outputType: 'boolean',
  exampleOutput: true,
  language: 'ts',  // or 'js'
});

console.log(result.fileName);     // 'validateEmail.ts'
console.log(result.testFileName); // 'validateEmail.test.ts'
console.log(result.source);       // generated TypeScript function
console.log(result.testSource);   // generated node:test template
```

### TypeScript output (`language: 'ts'`)

**`validateEmail.ts`**
```ts
/**
 * TODO: Describe the function purpose.
 * @param email - Email to validate
 * @returns Expected return type for this scaffold
 */
export function validateEmail(email: string): boolean {
  // TODO: implement business logic
  // Example input from scaffold config: { "email": "dev@example.com" }
  // Example output from scaffold config: true

  return true;
}
```

**`validateEmail.test.ts`**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail } from './validateEmail.js';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  assert.deepEqual(validateEmail("dev@example.com"), true);
});

test('TODO: add edge cases after implementation', () => {
  // Example: invalid email cases should be asserted here.
  assert.ok(true);
});
```

### JavaScript output (`language: 'js'`)

**`validateEmail.js`**
```js
/**
 * TODO: Describe the function purpose.
 * @param {string} email - Email to validate
 * @returns {boolean} Expected return type for this scaffold
 */
export function validateEmail(email) {
  // TODO: implement business logic
  // Example input from scaffold config: { "email": "dev@example.com" }
  // Example output from scaffold config: true

  return true;
}
```

**`validateEmail.test.js`**
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail } from './validateEmail.js';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  assert.deepEqual(validateEmail("dev@example.com"), true);
});

test('TODO: add edge cases after implementation', () => {
  // Example: invalid email cases should be asserted here.
  assert.ok(true);
});
```

### Writing files to disk

Use Node's built-in `writeFile` to persist the scaffold output to your project:

```typescript
import { writeFile } from 'node:fs/promises';
import { scaffoldFunction } from 'code-scaffold-mcp';

const result = scaffoldFunction({
  name: 'greetUser',
  paramDefs: [
    { name: 'name', tsType: 'string', example: 'Alice', description: 'Name of the user to greet' },
  ],
  outputType: 'string',
  exampleOutput: 'Hello, Alice!',
  language: 'ts',
});

await writeFile(result.fileName, result.source, 'utf8');
await writeFile(result.testFileName, result.testSource, 'utf8');

console.log(`Created ${result.fileName} and ${result.testFileName}`);
// Created greetUser.ts and greetUser.test.ts
```

**`greetUser.ts`** (generated)
```ts
/**
 * TODO: Describe the function purpose.
 * @param name - Name of the user to greet
 * @returns Expected return type for this scaffold
 */
export function greetUser(name: string): string {
  // TODO: implement business logic
  // Example input from scaffold config: { "name": "Alice" }
  // Example output from scaffold config: "Hello, Alice!"

  return "Hello, Alice!";
}
```

**`greetUser.test.ts`** (generated)
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { greetUser } from './greetUser.js';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  assert.deepEqual(greetUser("Alice"), "Hello, Alice!");
});

test('TODO: add edge cases after implementation', () => {
  // Example: invalid name cases should be asserted here.
  assert.ok(true);
});
```

## API

### `ParamDef`

```typescript
type ParamDef = {
  name: string;
  tsType: string;        // e.g. 'string', 'number', '{ id: string }'
  example: unknown;      // test fixture value used in the generated wiring test
  description?: string;  // appears in the generated JSDoc @param line
};
```

### `ScaffoldFunctionConfig`

```typescript
type ScaffoldFunctionConfig = {
  name: string;               // valid JS identifier for the function
  paramDefs: ParamDef[];
  outputType: string;         // TypeScript return type string
  returnDescription?: string; // @returns description (defaults to a placeholder)
  exampleOutput: unknown;     // fixture used in the generated return statement and wiring test
  language: 'ts' | 'js';
};
```

### `toJSParams(paramDefs, language?)`

Converts a `ParamDef` array into a function parameter string.

- TypeScript: `email: string, count: number`
- JavaScript: `email, count`

```typescript
import { toJSParams } from 'code-scaffold-mcp';

toJSParams([{ name: 'email', tsType: 'string', example: 'a@b.com' }], 'ts');
// → 'email: string'

toJSParams([{ name: 'email', tsType: 'string', example: 'a@b.com' }], 'js');
// → 'email'
```

### `toJSDOC(paramDefs, returnType, language?, returnDescription?)`

Generates a JSDoc comment block.

- TypeScript: `@param name - description` (types already in signature)
- JavaScript: `@param {type} name - description` (full JSDoc types)

```typescript
import { toJSDOC } from 'code-scaffold-mcp';

toJSDOC(
  [{ name: 'email', tsType: 'string', example: 'a@b.com', description: 'Email to validate' }],
  'boolean',
  'ts',
  'True if the email address is valid',
);
// →
// /**
//  * TODO: Describe the function purpose.
//  * @param email - Email to validate
//  * @returns True if the email address is valid
//  */
```

### `testTemplateGenerator(funcName, paramDefs, exampleOutput, language?)`

Generates a complete `node:test` test file. Includes a wiring test that uses `paramDefs[*].example` as call arguments and `exampleOutput` as the expected value, plus a placeholder edge-case test.

```typescript
import { testTemplateGenerator } from 'code-scaffold-mcp';

testTemplateGenerator(
  'validateEmail',
  [{ name: 'email', tsType: 'string', example: 'dev@example.com' }],
  true,
  'ts',
);
// → complete node:test source with assert.deepEqual wiring test
```

### `scaffoldFunction(config)`

Main scaffold generator. Combines all helpers to produce `{ fileName, testFileName, source, testSource }`. Throws if `name` or any param `name` is not a valid JavaScript identifier or is a reserved keyword.

## Error handling

`scaffoldFunction` validates inputs before generating any output. It throws a descriptive `Error` for:

- **Invalid identifiers** — function name or param name is empty, starts with a digit, or contains non-identifier characters:

  ```ts
  scaffoldFunction({ name: 'my-func', ... });
  // Error: scaffoldFunction: name 'my-func' is not a valid JavaScript identifier

  scaffoldFunction({ name: 'ok', paramDefs: [{ name: '1bad', ... }], ... });
  // Error: scaffoldFunction: param name '1bad' is not a valid JavaScript identifier
  ```

- **Reserved keywords** — function name or param name is a JavaScript reserved word:

  ```ts
  scaffoldFunction({ name: 'return', ... });
  // Error: scaffoldFunction: name 'return' is a reserved JavaScript keyword
  ```

`toSourceLiteral` (used internally for `example` and `exampleOutput` values) throws a `TypeError` if a value cannot be represented as a valid JS literal:

- Non-finite numbers (`Infinity`, `NaN`)
- Non-plain objects (`Map`, `Set`, `Date`, class instances)
- Functions, symbols, or bigints
- Circular references

  ```ts
  scaffoldFunction({ ..., exampleOutput: new Date() });
  // TypeError: toSourceLiteral only supports plain objects, arrays, and primitive JSON-like values.

  scaffoldFunction({ ..., exampleOutput: Infinity });
  // TypeError: toSourceLiteral only supports finite numbers.
  ```

Stick to JSON-like values (`null`, `undefined`, booleans, finite numbers, strings, arrays, and plain objects) for `example` and `exampleOutput`.

## Scripts

```bash
npm test           # run all tests with node:test
npm run typecheck  # TypeScript type check only (no emit)
npm run build      # compile to dist/
```

## Requirements

- Node 18+
