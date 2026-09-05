import { describe, it, expect } from 'vitest';
// src/index.js currently exports nothing (`export {}`), so there is no
// default export to import - `import * as` still gives a real Module
// Namespace Object, matching the original "loads without error, is an
// object" check.
import * as AbtestingModule from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-abtesting module', () => {
  it('loads without error', () => {
    expect(AbtestingModule).toBeTypeOf('object');
  });
});
