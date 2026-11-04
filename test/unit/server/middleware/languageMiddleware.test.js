import express from 'express';
import cookieParser from 'cookie-parser';
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
  app.use(cookieParser());
  app.use(languageMiddleware);
  app.use((req, res) => res.send(res.locals.language));
  return app;
}

describe('languageMiddleware', () => {
  const app = createApp();

  beforeEach(() => {
    testConfig.current = DEFAULT_TEST_CONFIG;
  });

  describe('language path switch', () => {
    it('stores the language for a year and redirects without the segment, keeping the encoded query', async () => {
      const response = await request(app).get('/sv/route/x?a=%26b&c=d');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/route/x?a=%26b&c=d');
      expect(response.headers['cache-control']).toBe('no-store');
      const [cookie] = response.headers['set-cookie'];
      expect(cookie).toMatch(/^lang=sv;/);
      expect(cookie).toContain('Max-Age=31536000');
      expect(cookie).toContain('SameSite=Lax');
    });

    it("switches to a deployment's own language outside the legacy prefixes", async () => {
      testConfig.current = {
        ...DEFAULT_TEST_CONFIG,
        availableLanguages: ['fi', 'sv', 'en', 'de'],
      };
      const response = await request(app).get('/de/x');

      expect(response.headers.location).toBe('/x');
      expect(response.headers['set-cookie'][0]).toMatch(/^lang=de;/);
    });

    it('strips a legacy prefix without storing it when redirectReittiopasParams is set', async () => {
      testConfig.current = {
        ...DEFAULT_TEST_CONFIG,
        redirectReittiopasParams: true,
      };
      const response = await request(app).get('/slangi/');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('leaves legacy prefixes alone when redirectReittiopasParams is not set', async () => {
      const response = await request(app).get('/ru/x');

      expect(response.status).toBe(200);
    });

    it('never redirects to a protocol-relative URL', async () => {
      const response = await request(app).get('/en/%5Cexample.com');
      expect(response.headers.location).toBe('/%5Cexample.com');

      const doubleSlash = await request(app).get('/en//example.com');
      expect(doubleSlash.headers.location).toBe('/example.com');
    });

    it('only treats a whole path segment as a language', async () => {
      const response = await request(app).get('/english/x');

      expect(response.status).toBe(200);
    });
  });

  describe('language resolution', () => {
    it('prefers the chosen (cookie) language over Accept-Language', async () => {
      const response = await request(app)
        .get('/')
        .set('Cookie', 'lang=sv')
        .set('Accept-Language', 'en');

      expect(response.text).toBe('sv');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('negotiates Accept-Language without a valid cookie', async () => {
      const response = await request(app)
        .get('/')
        .set('Cookie', 'lang=xx')
        .set('Accept-Language', 'de, en-GB;q=0.8, sv;q=0.5');

      expect(response.text).toBe('en');
    });

    it('falls back to the default language', async () => {
      const response = await request(app).get('/').set('Accept-Language', 'de');

      expect(response.text).toBe('fi');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('resolves a missing or wildcard header to the default, not the first available language', async () => {
      testConfig.current = {
        defaultLanguage: 'sv',
        availableLanguages: ['fi', 'sv', 'en'],
      };

      expect((await request(app).get('/')).text).toBe('sv');
      expect(
        (await request(app).get('/').set('Accept-Language', '*')).text,
      ).toBe('sv');
    });

    it('marks the response as varying by language inputs', async () => {
      const response = await request(app).get('/');

      expect(response.headers.vary).toBe('Accept-Language, Cookie');
    });
  });
});
