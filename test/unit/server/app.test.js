import request from 'supertest';
import fs from 'fs';
import path from 'path';
import createApp, { onError } from '../../../server/app';

// server/app.js's import chain reaches server/html/assetManifest.js, which
// reads manifest.json from disk at *module load time* when
// NODE_ENV isn't 'development'. vi.hoisted runs before this file's static
// imports, so forcing 'development' here makes them safe without a real
// webpack build present (unstubbed in the afterAll hook below).
// server/middleware/shell.js's dev-mode branch is also re-checked live on
// every request though, so NODE_ENV stays 'development' for this suite's
// test bodies too - it still reads the region's sprite file from _static/
// per request in dev mode, hence the placeholder fixture below.
vi.hoisted(() => vi.stubEnv('NODE_ENV', 'development'));

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

  describe('repeated slashes', () => {
    it('permanently redirects to single slashes, keeping the query', async () => {
      const response = await request(app).get('//sv//reitti?a=b');
      expect(response.status).toBe(301);
      expect(response.headers.location).toBe('/sv/reitti?a=b');
    });

    it('does not redirect to a protocol-relative URL', async () => {
      const response = await request(app).get('//example.com/x');
      expect(response.headers.location).toBe('/example.com/x');
    });
  });

  describe('/sw.js', () => {
    it('serves an uncached script that unregisters the old service worker', async () => {
      const response = await request(app).get('/sw.js');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain(
        'application/javascript',
      );
      expect(response.headers['cache-control']).toContain('max-age=0');
      expect(response.text).toContain('self.registration.unregister()');
    });
  });

  describe('/favicon.ico', () => {
    // Configs are cached on first use, so the icon directory must exist
    // before the first tampere request. A real build may have left one too,
    // hence the pattern rather than the fixture's exact name.
    const iconDir = path.join(staticDir, 'icons-tampere-fixture');

    beforeAll(() => {
      fs.mkdirSync(iconDir, { recursive: true });
    });

    afterAll(() => {
      fs.rmSync(iconDir, { recursive: true, force: true });
    });

    it("redirects to the requesting config's generated favicon", async () => {
      vi.stubEnv('CONFIG', 'tampere');
      const response = await request(app).get('/favicon.ico');
      expect(response.status).toBe(302);
      expect(response.headers.location).toMatch(
        /^\/assets\/icons-tampere-[^/]+\/favicon\.ico$/,
      );
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
      expect(response.headers['cache-control']).toBe('private, no-cache');
    });
  });

  describe('language links for search engines', () => {
    const linksOf = html =>
      [...html.matchAll(/<link rel="(alternate|canonical)"[^>]*>/g)].map(
        ([tag]) => tag,
      );

    it('links every language version, x-default and the canonical URL, without the query', async () => {
      const response = await request(app)
        .get('/en/reitti/a/b?time=1&arriveBy=true&utm_source=x&homescreen=1')
        .set('Host', 'example.com');
      expect(linksOf(response.text)).toEqual([
        '<link rel="alternate" hreflang="fi" href="https://example.com/reitti/a/b" />',
        '<link rel="alternate" hreflang="sv" href="https://example.com/sv/reitti/a/b" />',
        '<link rel="alternate" hreflang="en" href="https://example.com/en/reitti/a/b" />',
        '<link rel="alternate" hreflang="x-default" href="https://example.com/reitti/a/b" />',
        '<link rel="canonical" href="https://example.com/en/reitti/a/b" />',
      ]);
    });

    it('uses the root for the front page', async () => {
      const response = await request(app).get('/sv').set('Host', 'example.com');
      const links = linksOf(response.text);
      expect(links).toContain(
        '<link rel="alternate" hreflang="fi" href="https://example.com/" />',
      );
      expect(links).toContain(
        '<link rel="canonical" href="https://example.com/sv/" />',
      );
    });

    it('escapes the request URL in og:url', async () => {
      const response = await request(app)
        .get('/x?a=1&b=2')
        .set('Host', 'example.com');
      expect(response.text).toContain(
        '<meta property="og:url" content="https://example.com/x?a=1&amp;b=2"',
      );
    });

    it('keeps crafted paths inside the attribute', async () => {
      const response = await request(app)
        .get('/x"><y')
        .set('Host', 'example.com');
      expect(linksOf(response.text)).toContain(
        '<link rel="canonical" href="https://example.com/x%22%3E%3Cy" />',
      );
    });
  });

  describe('the page language', () => {
    it('renders the URL language as <html lang>, not into window.config', async () => {
      const response = await request(app).get('/sv/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('<html lang="sv">');
      expect(response.text).not.toContain('"language":');
    });

    it('serves the default language without a prefix, ignoring cookies and Accept-Language', async () => {
      const response = await request(app)
        .get('/')
        .set('Cookie', 'lang=sv')
        .set('Accept-Language', 'en-GB,en;q=0.9');
      expect(response.text).toContain('<html lang="fi">');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('permanently redirects /fi/ to /', async () => {
      const response = await request(app).get('/fi/');
      expect(response.status).toBe(301);
      expect(response.headers.location).toBe('/');
    });

    it('keeps the language prefix in legacy URL redirects', async () => {
      const response = await request(app).get('/en/reitti?time=x&a=b');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/en/reitti?a=b');
    });
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
