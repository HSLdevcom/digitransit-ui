import request from 'supertest';
import fs from 'fs';
import path from 'path';
import createApp, { onError } from '../../../server/app';

// server/app.js's import chain reaches server/html/assetManifest.js, which
// reads manifest.json/stats.json from disk at *module load time* when
// NODE_ENV isn't 'development'. vi.hoisted runs before this file's static
// imports, so forcing 'development' here makes them safe without a real
// webpack build present (unstubbed in the afterAll hook below).
// server/middleware/shell.js's dev-mode branch is also re-checked live on
// every request though, so NODE_ENV stays 'development' for this suite's
// test bodies too - it still reads the region's sprite file from _static/
// per request in dev mode, hence the placeholder fixture below.
vi.hoisted(() => vi.stubEnv('NODE_ENV', 'development'));

// Stands in for the real OIDC setup (which needs Redis and an OIDC
// provider): registers a route that, like the real /login and /logout,
// reads req.cookies.
vi.mock('../../../server/passport-openid-connect/openidConnect', () => ({
  default: app => {
    app.get('/login', (req, res) => res.send(req.cookies.lang));
    return undefined;
  },
}));

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('server app', () => {
  const staticDir = path.join(process.cwd(), '_static', 'assets');
  const spriteFixturePath = path.join(staticDir, 'svg-sprite.default.svg');
  const staticDirPreexisted = fs.existsSync(
    path.join(process.cwd(), '_static'),
  );
  let app;

  beforeAll(() => {
    fs.mkdirSync(staticDir, { recursive: true });
    fs.writeFileSync(spriteFixturePath, '<svg></svg>');

    vi.stubEnv('CONFIG', undefined);
    ({ app } = createApp());
  });

  afterAll(() => {
    fs.rmSync(spriteFixturePath, { force: true });
    if (!staticDirPreexisted) {
      fs.rmSync(path.join(process.cwd(), '_static'), {
        recursive: true,
        force: true,
      });
    }
  });

  afterEach(() => {
    vi.stubEnv('CONFIG', undefined);
  });

  describe('asset requests', () => {
    it('short-circuits /js/**, /css/** and /assets/** with a 404 instead of serving the shell', async () => {
      const response = await request(app).get('/js/main.js');
      expect(response.status).toBe(404);
    });
  });

  describe('the HTML shell', () => {
    it('renders a 200 HTML document with the injected window.config script', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('<!doctype html>');
      expect(response.text).toContain('window.config=');
      expect(response.text).toContain('<div id="app"');
    });
  });

  describe('the page language', () => {
    it("serializes the request's cookie language into window.config", async () => {
      const response = await request(app).get('/').set('Cookie', 'lang=sv');
      expect(response.text).toContain('"language":"sv"');
    });
  });

  describe('legacy locale path redirects', () => {
    it('redirects /fi/ to /?locale=fi for a deployment with redirectReittiopasParams enabled', async () => {
      vi.stubEnv('CONFIG', 'hsl');
      const response = await request(app).get('/fi/');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/?locale=fi');
    });
  });
});

describe('OIDC routes', () => {
  afterEach(() => {
    vi.stubEnv('OIDC_CLIENT_ID', undefined);
  });

  it('can read cookies, since cookie parsing is registered before them', async () => {
    vi.stubEnv('OIDC_CLIENT_ID', 'test-client');
    const { app } = createApp();

    const response = await request(app).get('/login').set('Cookie', 'lang=sv');

    expect(response.status).toBe(200);
    expect(response.text).toBe('sv');
  });
});

// Plain-JS mocks rather than a mocking library: res only needs setHeader
// (untracked here, since no test asserts on it) plus the chainable
// status()/type()/send() trio, and next() just needs its call args recorded.
function createMockRes({ headersSent = false } = {}) {
  const calls = { status: [], type: [], send: [] };
  const res = {
    headersSent,
    setHeader: () => {},
    status: (...args) => {
      calls.status.push(args);
      return res;
    },
    type: (...args) => {
      calls.type.push(args);
      return res;
    },
    send: (...args) => {
      calls.send.push(args);
      return res;
    },
  };
  return { res, calls };
}

describe('onError', () => {
  it('delegates to next(err) instead of responding again once headers are already sent', () => {
    const err = new Error('boom');
    const { res, calls } = createMockRes({ headersSent: true });
    const nextCalls = [];

    onError(err, {}, res, (...args) => nextCalls.push(args));

    expect(nextCalls).toEqual([[err]]);
    expect(calls.status).toEqual([]);
  });

  it('includes the error message and stack in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const err = new Error('boom');
    const { res, calls } = createMockRes();

    onError(err, {}, res, () => {});

    expect(calls.status).toEqual([[500]]);
    expect(calls.type).toEqual([['text/plain']]);
    expect(calls.send).toEqual([[`${err.message}\n${err.stack}`]]);
  });

  it('hides the error details behind a generic message outside development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const err = new Error('boom');
    const { res, calls } = createMockRes();

    onError(err, {}, res, () => {});

    expect(calls.send).toEqual([['Internal server error']]);
  });
});
