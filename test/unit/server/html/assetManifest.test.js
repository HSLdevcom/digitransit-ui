import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import fs from 'fs';
import path from 'path';
import {
  getMainAssets,
  getManifestScript,
  readStaticFile,
} from '../../../../server/html/assetManifest';

// server/html/assetManifest.js reads manifest.json/stats.json from disk at
// *module load time* when NODE_ENV isn't 'development' (mirrors the
// production webpack-build-output it expects). test/unit/helpers/init.js
// defaults NODE_ENV to 'development' for the whole test run so this static
// import is safe without a real build present. See
// server/html/assetManifest.js's own comment for why the read is eager
// rather than lazily memoized (it makes a misconfigured deployment fail at
// boot rather than on a user's first request).
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

  before(() => {
    if (!staticDirPreexisted) {
      fs.mkdirSync(path.join(process.cwd(), '_static'));
    }
    fs.writeFileSync(fixtureAbsolutePath, 'fixture content');
  });

  after(() => {
    fs.rmSync(fixtureAbsolutePath, { force: true });
    if (!staticDirPreexisted) {
      fs.rmdirSync(path.join(process.cwd(), '_static'));
    }
  });

  describe('in development (no webpack build output present)', () => {
    it('getMainAssets() returns undefined instead of reading manifest/stats files', () => {
      expect(getMainAssets()).to.be.undefined; // eslint-disable-line no-unused-expressions
    });

    it('getManifestScript() returns undefined instead of reading manifest/stats files', () => {
      expect(getManifestScript()).to.be.undefined; // eslint-disable-line no-unused-expressions
    });
  });

  describe('readStaticFile', () => {
    it('reads a file from _static/ regardless of NODE_ENV', () => {
      expect(readStaticFile(fixtureRelativePath).toString()).to.equal(
        'fixture content',
      );
    });
  });
});
