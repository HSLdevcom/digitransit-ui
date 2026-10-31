import fs from 'fs';
import path from 'path';

const sassDir = path.join(process.cwd(), 'sass');
const read = file => fs.readFileSync(path.join(sassDir, file), 'utf8');

describe('theme tokens', () => {
  // Every theme imports the default tokens, and a var() with no definition
  // doesn't fail the build, it silently drops the style.
  it('defines every custom property sass/base/_tokens.scss reads', () => {
    const used = [...read('base/_tokens.scss').matchAll(/var\((--[\w-]+)\)/g)];
    const defined = new Set(
      [...read('themes/default/tokens.scss').matchAll(/^\s+(--[\w-]+):/gm)].map(
        ([, name]) => name,
      ),
    );

    expect(used.map(([, name]) => name).filter(n => !defined.has(n))).toEqual(
      [],
    );
  });
});
