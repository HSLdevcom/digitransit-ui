import fs from 'fs';
import path from 'path';
import { getNamedConfiguration } from '../../../../server/configs/config';
import {
  buildSprite,
  iconsDir,
  listThemes,
} from '../../../../scripts/build/buildSprites';

const configNames = fs
  .readdirSync(path.join(process.cwd(), 'server', 'configs'))
  .filter(file => /^config\.\w+\.js$/.test(file))
  .map(file => file.replace('config.', '').replace('.js', ''));

const symbolIds = sprite =>
  [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(match => match[1]);

const iconIds = theme =>
  fs
    .readdirSync(path.join(iconsDir, theme))
    .map(file => path.basename(file, '.svg'));

describe('SVG sprites', () => {
  it.each(configNames)('%s names a sprite that gets built', configName => {
    const { sprites } = getNamedConfiguration(configName);
    const theme = sprites.match(/^assets\/svg-sprite\.(\w+)\.svg$/)?.[1];
    expect(listThemes()).toContain(theme);
  });

  it.each(listThemes())(
    '%s builds, with one symbol per icon named after its file',
    theme => {
      const ids = new Set([...iconIds('default'), ...iconIds(theme)]);
      expect(symbolIds(buildSprite(theme)).sort()).toEqual([...ids].sort());
    },
  );

  it.each(listThemes())('%s only has icon files with id-safe names', theme => {
    const invalid = fs
      .readdirSync(path.join(iconsDir, theme))
      .filter(file => !/^[\w-]+\.svg$/.test(file));
    expect(invalid).toEqual([]);
  });

  // Every symbol ends up in the same page, so an id inside one icon (e.g. a
  // design tool's `clip0`) that repeats in another makes one of them silently
  // render with the other's clip path, mask or gradient.
  it.each(listThemes())('%s has no id used twice', theme => {
    const ids = [...buildSprite(theme).matchAll(/\sid="([^"]+)"/g)].map(
      match => match[1],
    );
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });

  it('uses a theme icon over the default icon of the same name', () => {
    const [id] = iconIds('hsl').filter(icon =>
      iconIds('default').includes(icon),
    );
    const hslIcon = fs.readFileSync(path.join(iconsDir, 'hsl', `${id}.svg`));
    const body = hslIcon.toString().match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1];

    expect(buildSprite('hsl')).toContain(body);
    expect(buildSprite('default')).not.toContain(body);
  });
});
