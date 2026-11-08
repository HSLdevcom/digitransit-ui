import request from 'supertest';
import fs from 'fs';
import path from 'path';
import createApp, { onError } from '../../../server/app';

// Runs the app as in development (unstubbed in the afterAll hook below): the
// shell reads the region's sprite file from _static/ per request, hence the
// placeholder fixture. The build's files come from a fake assets middleware.
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

// Stands in for the assets middleware (see server/server.js).
function fakeAssetsMiddleware(req, res, next) {
  res.locals.assets = {
    manifest: {
      entrypoints: {
        main: { assets: { js: ['js/main.js'] } },
        default_theme: {
          assets: {
            css: ['css/default_theme.css'],
            js: ['js/default_theme.js'],
          },
        },
      },
    },
    mainAssets: ['css/main.css', 'js/main.js'],
    manifestScript: '',
  };
  next();
}

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
    ({ app } = createApp(fakeAssetsMiddleware));
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

  describe('repeated slashes in redirect path', () => {
    it('does not redirect to a protocol-relative URL', async () => {
      const response = await request(app).get('//example.com/x?time=abc');
      expect(response.status).toBe(302);
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
    });

    it('links the theme first, then the entry CSS and JS from the manifest', async () => {
      const response = await request(app).get('/');
      const stylesheets = [
        ...response.text.matchAll(
          /<link rel="stylesheet"[^>]* href="([^"]+)"/g,
        ),
      ].map(([, href]) => href);
      expect(stylesheets.slice(0, 2)).toEqual([
        '/css/default_theme.css',
        '/css/main.css',
      ]);
      // Development loads the theme's script too, for hot updates.
      const scripts = [...response.text.matchAll(/<script src="([^"]+)"/g)].map(
        ([, src]) => src,
      );
      expect(scripts).toEqual(['/js/default_theme.js', '/js/main.js']);
    });

    it("names the missing theme entry if the build doesn't include it", async () => {
      const { app: appWithoutTheme } = createApp((req, res, next) =>
        fakeAssetsMiddleware(req, res, () => {
          res.locals.assets.manifest.entrypoints = {};
          next();
        }),
      );
      const response = await request(appWithoutTheme).get('/');
      expect(response.status).toBe(500);
      expect(response.text).toContain('No default_theme entry in the build');
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
    const { app } = createApp(fakeAssetsMiddleware);

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
