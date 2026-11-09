import { createStore } from 'redux';
import Actions from 'farce/Actions';
import createHistoryEnhancer from 'farce/createHistoryEnhancer';
import locationReducer from 'farce/locationReducer';
import MemoryProtocol from 'farce/MemoryProtocol';
import { createHistoryMiddlewares } from '../../../app/routes/routes';

function createHistory(initialUrl, basename) {
  const protocol = new MemoryProtocol(initialUrl);
  const store = createStore(
    locationReducer,
    createHistoryEnhancer({
      protocol,
      middlewares: createHistoryMiddlewares(basename),
    }),
  );
  store.dispatch(Actions.init());
  return { protocol, store };
}

describe('createHistoryMiddlewares', () => {
  it('gives the router the path without the language prefix', () => {
    const { store } = createHistory('/en/reitti/a/b?time=1', '/en');
    expect(store.getState()).toMatchObject({
      pathname: '/reitti/a/b',
      query: { time: '1' },
    });
  });

  it('keeps the language prefix in browser URLs', () => {
    const { protocol, store } = createHistory('/en/', '/en');
    store.dispatch(
      Actions.push({ pathname: '/reitti/a/b', query: { time: '1' } }),
    );
    expect(store.getState().pathname).toBe('/reitti/a/b');
    expect(protocol.init().pathname).toBe('/en/reitti/a/b');
    expect(
      store.farce.createHref({ pathname: '/pysakit/x', query: { a: '1' } }),
    ).toBe('/en/pysakit/x?a=1');
  });

  it('leaves default language URLs unprefixed', () => {
    const { protocol, store } = createHistory('/reitti/a/b', '');
    expect(store.getState().pathname).toBe('/reitti/a/b');
    store.dispatch(Actions.push({ pathname: '/pysakit/x' }));
    expect(protocol.init().pathname).toBe('/pysakit/x');
  });
});
