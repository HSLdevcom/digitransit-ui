import fs from 'fs';
import path from 'path';
import {
  getMainAssets,
  getManifestScript,
  readStaticFile,
} from '../../../../server/html/assetManifest';

// server/html/assetManifest.js reads manifest.json/stats.json from disk at
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
    it('getMainAssets() returns undefined instead of reading manifest/stats files', () => {
      expect(getMainAssets()).toBeUndefined();
    });

    it('getManifestScript() returns undefined instead of reading manifest/stats files', () => {
      expect(getManifestScript()).toBeUndefined();
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
