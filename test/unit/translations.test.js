import { describe, it } from 'vitest';

import fi from '../../app/translations/fi';
import sv from '../../app/translations/sv';
import en from '../../app/translations/en';

describe('translations', () => {
  it('English translations should have all the Finnish terms', () => {
    const missing = {};
    Object.keys(fi.fi)
      .filter(key => en.en[key] === undefined)
      .forEach(key => {
        missing[key] = fi.fi[key];
      });
    expect(missing).toEqual({});
  });

  it('Swedish translations should have all the Finnish terms', () => {
    const missing = {};
    Object.keys(fi.fi)
      .filter(key => sv.sv[key] === undefined)
      .forEach(key => {
        missing[key] = fi.fi[key];
      });
    expect(missing).toEqual({});
  });
});
