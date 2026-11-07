import createDevMiddleware from '../../../../server/middleware/devMiddleware';

// A build with a main entry (plus a hot update) and a theme entry.
const { build } = vi.hoisted(() => {
  const files = {
    main: ['css/main.css', 'js/main.js', 'main.abc.hot-update.js'],
    hsl_theme: ['css/hsl_theme.css', 'js/hsl_theme.js'],
  };
  return {
    build: {
      error: undefined,
      compilation: {
        entrypoints: new Map(
          Object.entries(files).map(([name, entryFiles]) => [
            name,
            { getFiles: () => entryFiles },
          ]),
        ),
        getAsset: name => ({
          info: { hotModuleReplacement: name.endsWith('.hot-update.js') },
        }),
      },
    },
  };
});

const { calls } = vi.hoisted(() => ({ calls: [] }));

vi.mock('webpack', () => ({
  default: () => ({
    close: callback => {
      calls.push('compiler.close');
      callback();
    },
  }),
}));
vi.mock('../../../../webpack.config.js', () => ({ default: {} }));
vi.mock('webpack-dev-middleware', () => ({
  default: () => {
    const middleware = (req, res, next) => {
      res.locals.webpack = {
        devMiddleware: { stats: { compilation: build.compilation } },
      };
      next(build.error);
    };
    middleware.close = callback => {
      calls.push('middleware.close');
      callback();
    };
    return middleware;
  },
}));

function run(middleware) {
  const res = { locals: {} };
  let nextArgs;
  middleware({}, res, (...args) => {
    nextArgs = args;
  });
  return { res, nextArgs };
}

describe('createDevMiddleware', () => {
  afterEach(() => {
    build.error = undefined;
    calls.length = 0;
  });

  it('closes the middleware, then the compiler, before calling back', () => {
    const callback = vi.fn(() => calls.push('callback'));

    createDevMiddleware().close(callback);

    expect(calls).toEqual(['middleware.close', 'compiler.close', 'callback']);
    expect(callback).toHaveBeenCalledWith(undefined);
  });

  it("puts the build's entry files on res.locals.assets, without hot updates", () => {
    const { res, nextArgs } = run(createDevMiddleware());

    expect(nextArgs[0]).toBeUndefined();
    expect(res.locals.assets.mainAssets).toEqual([
      'css/main.css',
      'js/main.js',
    ]);
    expect(res.locals.assets.manifestScript).toBe('');
    expect(res.locals.assets.manifest.entrypoints.hsl_theme.assets).toEqual({
      js: ['js/hsl_theme.js'],
      css: ['css/hsl_theme.css'],
    });
  });

  it('passes a build error on without assets', () => {
    build.error = new Error('build failed');

    const { res, nextArgs } = run(createDevMiddleware());

    expect(nextArgs).toEqual([build.error]);
    expect(res.locals.assets).toBeUndefined();
  });
});
