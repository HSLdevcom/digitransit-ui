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
      expect(cookie).toContain('HttpOnly');
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
    it('uses the chosen (cookie) language and refreshes its expiry', async () => {
      const response = await request(app).get('/').set('Cookie', 'lang=sv');

      expect(response.text).toBe('sv');
      const [cookie] = response.headers['set-cookie'];
      expect(cookie).toMatch(/^lang=sv;/);
      expect(cookie).toContain('Max-Age=31536000');
      expect(cookie).toContain('HttpOnly');
    });

    it('clears an unavailable cookie language and uses the default', async () => {
      const response = await request(app).get('/').set('Cookie', 'lang=xx');

      expect(response.text).toBe('fi');
      const [cookie] = response.headers['set-cookie'];
      expect(cookie).toMatch(/^lang=;/);
      expect(cookie).toContain('Expires=Thu, 01 Jan 1970');
    });

    it('falls back to the default language, ignoring Accept-Language', async () => {
      const response = await request(app).get('/').set('Accept-Language', 'en');

      expect(response.text).toBe('fi');
      expect(response.headers['set-cookie']).toBeUndefined();
    });

    it('marks the response as varying by the language cookie', async () => {
      const response = await request(app).get('/');

      expect(response.headers.vary).toBe('Cookie');
    });
  });
});
