import slashMiddleware from '../../../../server/middleware/slashMiddleware';

/** Runs the middleware on a raw URL; returns the redirect, or 'next'. */
function run(url) {
  let result = 'next';
  const req = { path: url.split('?')[0], originalUrl: url };
  const res = {
    redirect: (status, location) => {
      result = [status, location];
    },
  };
  slashMiddleware(req, res, () => {});
  return result;
}

describe('slashMiddleware', () => {
  it('leaves single slashes alone', () => {
    ['/', '/sv/', '/sv/reitti?a=b//c'].forEach(url =>
      expect(run(url)).toBe('next'),
    );
  });

  it('permanently redirects repeated slashes and backslashes, keeping the query', () => {
    expect(run('//sv//reitti?a=b')).toEqual([301, '/sv/reitti?a=b']);
    expect(run('/\\sv\\x')).toEqual([301, '/sv/x']);
  });

  it('does not redirect to a protocol-relative URL', () => {
    expect(run('/\\/example.com')).toEqual([301, '/example.com']);
  });
});
