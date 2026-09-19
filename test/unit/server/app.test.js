import { expect } from 'chai';
import { describe, it, before, after, afterEach } from 'mocha';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import createApp from '../../../server/app';

// server/app.js's import chain reaches server/html/assetManifest.js, which
// reads manifest.json/stats.json from disk at *module load time* when
// NODE_ENV isn't 'development' - test/unit/helpers/init.js temporarily
// defaults it to 'development' during mocha's module-loading phase (and
// restores it before any test runs) so this static import is safe without a
// real webpack build present. server/middleware/shell.js's dev-mode branch
// is also re-checked live on every request though, so this suite sets
// NODE_ENV='development' again for its own test bodies specifically - it
// still reads the region's sprite file from _static/ per request in dev
// mode, hence the placeholder fixture below.
describe('server app', () => {
  const staticDir = path.join(process.cwd(), '_static', 'assets');
  const spriteFixturePath = path.join(staticDir, 'svg-sprite.default.svg');
  const staticDirPreexisted = fs.existsSync(
    path.join(process.cwd(), '_static'),
  );
  let originalConfig;
  let originalNodeEnv;
  let app;

  before(() => {
    // Captured here, not at describe-body scope: this file's top-level code
    // runs during mocha's module-loading phase, while
    // test/unit/helpers/init.js has NODE_ENV temporarily forced to
    // 'development' - capturing "original" values that early would freeze
    // in that temporary value instead of the real one, and leak it into
    // every test file that runs after this suite's `after` hook below.
    originalConfig = process.env.CONFIG;
    originalNodeEnv = process.env.NODE_ENV;

    fs.mkdirSync(staticDir, { recursive: true });
    fs.writeFileSync(spriteFixturePath, '<svg></svg>');

    delete process.env.CONFIG;
    process.env.NODE_ENV = 'development';
    ({ app } = createApp());
  });

  after(() => {
    process.env.NODE_ENV = originalNodeEnv;
    fs.rmSync(spriteFixturePath, { force: true });
    if (!staticDirPreexisted) {
      fs.rmSync(path.join(process.cwd(), '_static'), {
        recursive: true,
        force: true,
      });
    }
  });

  afterEach(() => {
    if (originalConfig === undefined) {
      delete process.env.CONFIG;
    } else {
      process.env.CONFIG = originalConfig;
    }
  });

  describe('asset requests', () => {
    it('short-circuits /js/**, /css/** and /assets/** with a 404 instead of serving the shell', async () => {
      const response = await request(app).get('/js/main.js');
      expect(response.status).to.equal(404);
    });
  });

  describe('the HTML shell', () => {
    it('renders a 200 HTML document with the injected window.config script', async () => {
      const response = await request(app).get('/');
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.include('text/html');
      expect(response.text).to.include('<!doctype html>');
      expect(response.text).to.include('window.config=');
      expect(response.text).to.include('<div id="app"');
    });
  });

  describe('legacy locale path redirects', () => {
    it('redirects /fi/ to /?locale=fi for a deployment with redirectReittiopasParams enabled', async () => {
      process.env.CONFIG = 'hsl';
      const response = await request(app).get('/fi/');
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/?locale=fi');
    });
  });
});
