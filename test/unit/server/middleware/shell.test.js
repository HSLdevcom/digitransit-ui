import { expect } from 'chai';
import { describe, it } from 'mocha';
import { resolveLocale } from '../../../../server/middleware/shell';

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

    expect(locale).to.equal('sv');
  });

  it('falls back to config.defaultLanguage when the cookie locale is missing', () => {
    const req = createMockReq({});
    const res = createMockRes();

    const locale = resolveLocale({ ...config }, req, res);

    expect(locale).to.equal('fi');
  });

  it('falls back to config.defaultLanguage when the cookie locale is invalid', () => {
    const req = createMockReq({ lang: 'xx' });
    const res = createMockRes();

    const locale = resolveLocale({ ...config }, req, res);

    expect(locale).to.equal('fi');
  });

  it('sets the cookie only when the resolved locale differs from the current one', () => {
    const req = createMockReq({ lang: 'xx' });
    const res = createMockRes();

    resolveLocale({ ...config }, req, res);

    expect(res.cookieCalls).to.deep.equal([['lang', 'fi']]);
  });

  it('does not set the cookie when the resolved locale already matches', () => {
    const req = createMockReq({ lang: 'sv' });
    const res = createMockRes();

    resolveLocale({ ...config }, req, res);

    expect(res.cookieCalls).to.deep.equal([]);
  });

  it('stamps the resolved locale onto config.language', () => {
    const req = createMockReq({ lang: 'en' });
    const res = createMockRes();
    const mutableConfig = { ...config };

    resolveLocale(mutableConfig, req, res);

    expect(mutableConfig.language).to.equal('en');
  });
});
