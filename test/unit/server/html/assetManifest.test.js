import fs from 'fs';
import path from 'path';
import { createManifestMiddleware } from '../../../../server/html/assetManifest';

const manifest = {
  'hsl_theme.css': 'css/hsl_theme.abc.css',
  entrypoints: {
    main: {
      assets: {
        js: ['js/runtime.r1.js', 'js/react.r2.js', 'js/main.m1.js'],
        css: ['css/digitransit-components.c1.css', 'css/main.c2.css'],
      },
    },
  },
};

describe('assetManifest', () => {
  describe('createManifestMiddleware', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('puts the entry files from manifest.json on res.locals.assets and inlines the runtime chunk', () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(file =>
        file.endsWith('manifest.json')
          ? JSON.stringify(manifest)
          : `/* ${path.basename(file)} */`,
      );
      const res = { locals: {} };
      let nextCalled = false;

      createManifestMiddleware()({}, res, () => {
        nextCalled = true;
      });

      expect(nextCalled).toBe(true);
      expect(res.locals.assets.mainAssets).toEqual([
        'css/digitransit-components.c1.css',
        'css/main.c2.css',
        'js/react.r2.js',
        'js/main.m1.js',
      ]);
      expect(res.locals.assets.manifestScript).toBe('/* runtime.r1.js */');
      expect(res.locals.assets.manifest['hsl_theme.css']).toBe(
        'css/hsl_theme.abc.css',
      );
    });

    it('fails right away without a build', () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('ENOENT: manifest.json');
      });

      expect(() => createManifestMiddleware()).toThrow('ENOENT');
    });
  });
});
