import express from 'express';
import request from 'supertest';
import languageMiddleware from '../../../../server/middleware/languageMiddleware';

const DEFAULT_TEST_CONFIG = {
  defaultLanguage: 'fi',
  availableLanguages: ['fi', 'sv', 'en'],
};
const { testConfig } = vi.hoisted(() => ({ testConfig: { current: null } }));
vi.mock('../../../../server/configs/config', () => ({
  getConfiguration: () => testConfig.current,
}));

function createApp() {
  const app = express();
  app.use(languageMiddleware);
  app.use((req, res) =>
    res.json({ language: res.locals.language, url: req.url }),
  );
  return app;
}

describe('languageMiddleware', () => {
  const app = createApp();

  beforeEach(() => {
    testConfig.current = DEFAULT_TEST_CONFIG;
  });

  it('serves the default language without a prefix', async () => {
    const response = await request(app).get('/route/x?a=b');

    expect(response.body).toEqual({ language: 'fi', url: '/route/x?a=b' });
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('serves a language prefix as it is, without redirecting', async () => {
    const response = await request(app).get('/sv/route/x?a=%26b');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      language: 'sv',
      url: '/sv/route/x?a=%26b',
    });
  });

  it('ignores Accept-Language and cookies', async () => {
    const response = await request(app)
      .get('/')
      .set('Accept-Language', 'en')
      .set('Cookie', 'lang=sv');

    expect(response.body.language).toBe('fi');
  });

  it('permanently redirects the default language prefix to the root, keeping the encoded query', async () => {
    const response = await request(app).get('/fi/route/x?a=%26b&c=d');

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/route/x?a=%26b&c=d');
  });

  it("supports a deployment's own languages", async () => {
    testConfig.current = {
      defaultLanguage: 'en',
      availableLanguages: ['en', 'de'],
    };

    expect((await request(app).get('/de/x')).body.language).toBe('de');
    expect((await request(app).get('/en/x')).headers.location).toBe('/x');
  });

  it('strips an unavailable legacy prefix when redirectReittiopasParams is set', async () => {
    testConfig.current = {
      ...DEFAULT_TEST_CONFIG,
      redirectReittiopasParams: true,
    };
    const response = await request(app).get('/slangi/x?a=b');

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/x?a=b');
  });

  it('leaves legacy prefixes alone when redirectReittiopasParams is not set', async () => {
    const response = await request(app).get('/ru/x');

    expect(response.body).toMatchObject({ language: 'fi', url: '/ru/x' });
  });
});
