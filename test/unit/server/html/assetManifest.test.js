import fs from 'fs';
import path from 'path';
import {
  getMainAssets,
  getManifestScript,
  readStaticFile,
} from '../../../../server/html/assetManifest';

// server/html/assetManifest.js reads manifest.json from disk at
// *module load time* when NODE_ENV isn't 'development' (mirrors the
// production webpack-build-output it expects). vi.hoisted runs before this
// file's static imports, so forcing 'development' here makes them safe
// without a real build present (unstubbed in the afterAll hook below). See
// server/html/assetManifest.js's own comment for why the read is eager
// rather than lazily memoized (it makes a misconfigured deployment fail at
// boot rather than on a user's first request).
vi.hoisted(() => vi.stubEnv('NODE_ENV', 'development'));

describe('assetManifest', () => {
  const fixtureRelativePath = 'assetManifest.test-fixture.txt';
  const fixtureAbsolutePath = path.join(
    process.cwd(),
    '_static',
    fixtureRelativePath,
  );
  const staticDirPreexisted = fs.existsSync(
    path.join(process.cwd(), '_static'),
  );

  beforeAll(() => {
    if (!staticDirPreexisted) {
      fs.mkdirSync(path.join(process.cwd(), '_static'));
    }
    fs.writeFileSync(fixtureAbsolutePath, 'fixture content');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    fs.rmSync(fixtureAbsolutePath, { force: true });
    if (!staticDirPreexisted) {
      fs.rmdirSync(path.join(process.cwd(), '_static'));
    }
  });

  describe('in development (no webpack build output present)', () => {
    it('getMainAssets() returns undefined instead of reading the manifest', () => {
      expect(getMainAssets()).toBeUndefined();
    });

    it('getManifestScript() returns undefined instead of reading the manifest', () => {
      expect(getManifestScript()).toBeUndefined();
    });
  });

  describe('in production', () => {
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

    afterEach(() => {
      vi.doUnmock('fs');
      vi.stubEnv('NODE_ENV', 'development');
    });

    it('reads entrypoint assets from manifest.json and inlines the runtime chunk', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.resetModules();
      vi.doMock('fs', () => ({
        default: {
          readFileSync: file =>
            file.endsWith('manifest.json')
              ? JSON.stringify(manifest)
              : `/* ${path.basename(file)} */`,
        },
      }));
      const assetManifest = await import(
        '../../../../server/html/assetManifest'
      );

      expect(assetManifest.getMainAssets()).toEqual([
        'css/digitransit-components.c1.css',
        'css/main.c2.css',
        'js/react.r2.js',
        'js/main.m1.js',
      ]);
      expect(assetManifest.getManifestScript()).toBe('/* runtime.r1.js */');
      expect(assetManifest.getAssetPath('hsl_theme.css')).toBe(
        'css/hsl_theme.abc.css',
      );
    });
  });

  describe('readStaticFile', () => {
    it('reads a file from _static/ regardless of NODE_ENV', () => {
      expect(readStaticFile(fixtureRelativePath).toString()).toBe(
        'fixture content',
      );
    });
  });
});
