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
    expect(missing).toEqual(
      {},
      'the English translations are missing for these Finnish terms',
    );
  });

  it('Swedish translations should have all the Finnish terms', () => {
    const missing = {};
    Object.keys(fi.fi)
      .filter(key => sv.sv[key] === undefined)
      .forEach(key => {
        missing[key] = fi.fi[key];
      });
    expect(missing).toEqual(
      {},
      'the Swedish translations are missing for these Finnish terms',
    );
  });
});
