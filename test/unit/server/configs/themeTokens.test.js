import fs from 'fs';
import path from 'path';

const stylesDir = path.join(process.cwd(), 'styles');
const read = file => fs.readFileSync(path.join(stylesDir, file), 'utf8');

describe('theme tokens', () => {
  // Every theme imports the default tokens, and a var() with no definition
  // doesn't fail the build, it silently drops the style.
  it('defines every custom property styles/abstracts/_variables.scss reads', () => {
    const used = [
      ...read('abstracts/_variables.scss').matchAll(/var\((--[\w-]+)\)/g),
    ];
    const defined = new Set(
      [...read('themes/default/theme.scss').matchAll(/^\s+(--[\w-]+):/gm)].map(
        ([, name]) => name,
      ),
    );

    expect(used.map(([, name]) => name).filter(n => !defined.has(n))).toEqual(
      [],
    );
  });
});
