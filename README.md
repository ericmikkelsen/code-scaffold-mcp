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
  exampleInput: { email: 'dev@example.com' },
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
  // Example input from scaffold config: { email: 'dev@example.com' }
  // Example output from scaffold config: true

  return true;
}
```

**`validateEmail.test.ts`**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEmail } from './validateEmail';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  assert.equal(validateEmail('dev@example.com'), true);
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
  // Example input from scaffold config: { email: 'dev@example.com' }
  // Example output from scaffold config: true

  return true;
}
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
  exampleInput: { name: 'Alice' },
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
  // Example input from scaffold config: { name: 'Alice' }
  // Example output from scaffold config: 'Hello, Alice!'

  return 'Hello, Alice!';
}
```

**`greetUser.test.ts`** (generated)
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { greetUser } from './greetUser';

test('TODO: replace with real behavior tests', () => {
  // This starter test confirms wiring only.
  assert.equal(greetUser('Alice'), 'Hello, Alice!');
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
  tsType: string;    // e.g. 'string', 'number', '{ id: string }'
  example: unknown;  // test fixture value
  description?: string;
};
```

### `toJSParams(paramDefs, language?)`

Converts a `ParamDef` array into a function parameter string.

- TypeScript: `email: string, count: number`
- JavaScript: `email, count`

### `toJSDOC(paramDefs, returnType, language?)`

Generates a JSDoc comment block.

- TypeScript: `@param name - description` (types already in signature)
- JavaScript: `@param {type} name - description` (full JSDoc types)

### `testTemplateGenerator(funcName, paramDefs, example, language?)`

Generates a complete `node:test` test file. Includes a wiring test that uses the example fixture and a placeholder edge-case test.

### `scaffoldFunction(config)`

Main scaffold generator. Combines all helpers to produce `{ fileName, testFileName, source, testSource }`.

## Scripts

```bash
npm test           # run all tests with node:test
npm run typecheck  # TypeScript type check only (no emit)
npm run build      # compile to dist/
```

## Requirements

- Node 18+
