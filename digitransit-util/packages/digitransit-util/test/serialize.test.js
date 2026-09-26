import { describe, it, expect } from 'vitest';
import serialize from '../src/serialize.js';

describe('serialize', () => {
  it('Checking that null returns empty', () => {
    const retValue = serialize(null, 'hello');
    expect('').toBe(retValue);
  });
});
