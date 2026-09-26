import { resolveLocale } from '../../../../server/middleware/shell';

// server/middleware/shell.js imports server/html/assetManifest.js, which
// reads manifest.json/stats.json from disk at *module load time* unless
// NODE_ENV is 'development' - vi.hoisted forces that before this file's
// static imports run, so no real webpack build is needed.
const originalNodeEnv = vi.hoisted(() => {
  const value = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  return value;
});

afterAll(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

// Plain-JS mocks rather than a mocking library: res only needs `cookie()`
// tracked, req just carries `cookies`.
function createMockReq(cookies = {}) {
  return { cookies };
}

function createMockRes() {
  const cookieCalls = [];
  return {
    cookie: (...args) => cookieCalls.push(args),
    cookieCalls,
  };
}

const config = {
  defaultLanguage: 'fi',
  availableLanguages: ['fi', 'sv', 'en'],
};

describe('resolveLocale', () => {
  it('uses the cookie locale when it is valid', () => {
    const req = createMockReq({ lang: 'sv' });
    const res = createMockRes();

    const locale = resolveLocale({ ...config }, req, res);

    expect(locale).toBe('sv');
  });

  it('falls back to config.defaultLanguage when the cookie locale is missing', () => {
    const req = createMockReq({});
    const res = createMockRes();

    const locale = resolveLocale({ ...config }, req, res);

    expect(locale).toBe('fi');
  });

  it('falls back to config.defaultLanguage when the cookie locale is invalid', () => {
    const req = createMockReq({ lang: 'xx' });
    const res = createMockRes();

    const locale = resolveLocale({ ...config }, req, res);

    expect(locale).toBe('fi');
  });

  it('sets the cookie only when the resolved locale differs from the current one', () => {
    const req = createMockReq({ lang: 'xx' });
    const res = createMockRes();

    resolveLocale({ ...config }, req, res);

    expect(res.cookieCalls).toEqual([['lang', 'fi']]);
  });

  it('does not set the cookie when the resolved locale already matches', () => {
    const req = createMockReq({ lang: 'sv' });
    const res = createMockRes();

    resolveLocale({ ...config }, req, res);

    expect(res.cookieCalls).toEqual([]);
  });

  it('stamps the resolved locale onto config.language', () => {
    const req = createMockReq({ lang: 'en' });
    const res = createMockRes();
    const mutableConfig = { ...config };

    resolveLocale(mutableConfig, req, res);

    expect(mutableConfig.language).toBe('en');
  });
});
